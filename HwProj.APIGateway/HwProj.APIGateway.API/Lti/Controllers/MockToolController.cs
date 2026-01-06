using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using Newtonsoft.Json.Linq;

[Route("api/mocktool")]
[ApiController]
public class MockToolController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromForm] string iss, [FromForm] string login_hint, [FromForm] string lti_message_hint)
    {
// Эмулируем редирект обратно на Платформу (Authorize)
// В реальном мире тут инструмент генерирует nonce и state
        var callbackUrl = $"{iss}/api/lti/authorize?" +
                          $"client_id=mock-tool-client-id&" +
                          $"response_type=id_token&" +
                          $"redirect_uri=http://localhost:5000/api/mocktool/callback&" + // Куда вернуть токен
                          $"login_hint={login_hint}&" +
                          $"lti_message_hint={lti_message_hint}&" +
                          $"scope=openid&state=xyz&nonce=123";

        return Redirect(callbackUrl);
    }

    [HttpPost("callback")]
    public IActionResult Callback([FromForm] string id_token)
    {
        var handler = new JwtSecurityTokenHandler();
        
        // Читаем входящий токен (без валидации подписи, т.к. это мок)
        var token = handler.ReadJwtToken(id_token);
        
        // Достаем URL возврата
        var settingsClaim = token.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings");
        if (settingsClaim == null) return BadRequest("No deep linking settings found");

        var settings = JsonDocument.Parse(settingsClaim.Value);
        var returnUrl = settings.RootElement.GetProperty("deep_link_return_url").GetString();

        // --- ГЕНЕРАЦИЯ ОТВЕТА ---

        // 1. Формируем Content Items, используя обычные C# объекты (Arrays/Anonymous Objects)
        // Это гарантирует правильный JSON на выходе.
        var contentItems = new List<Dictionary<string, object>>
        {
            new Dictionary<string, object>
            {
                ["type"] = "ltiResourceLink",
                ["title"] = "Тестовая Задача из Мока",
                ["url"] = "http://localhost:5000/mock/task/1",
                ["text"] = "Описание тестовой задачи"
            }
        };
        
        contentItems.Add(new Dictionary<string, object>
        {
            ["type"] = "ltiResourceLink",
            ["title"] = "Тестовая Задача из Мока2",
            ["url"] = "http://localhost:5000/mock/task/2",
            ["text"] = "Описание тестовой задачи2"
        });

        // 2. Собираем Payload
        var payload = new JwtPayload
        {
            { "iss", "MockTool" },
            { "aud", "HwProj" },
            { "iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds() },
            { "exp", DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds() },
            { "nonce", "random-nonce-123" }, // LTI требует nonce
            { "https://purl.imsglobal.org/spec/lti-dl/claim/message_type", "LtiDeepLinkingResponse" },
            { "https://purl.imsglobal.org/spec/lti-dl/claim/version", "1.3.0" },
            { "https://purl.imsglobal.org/spec/lti-dl/claim/content_items", contentItems }
        };

        // 3. Создаем Header с "пустой" подписью, чтобы библиотека не ругалась
        // В реальном LTI здесь должен быть реальный ключ. Для мока делаем "unsigned".
        var header = new JwtHeader();
        
        // ВАЖНО: JwtSecurityTokenHandler по умолчанию не дает создать токен без подписи.
        // Мы обойдем это, создав токен вручную, или просто подпишем "мусорным" ключом.
        // Самый простой способ для мока - подписать любым ключом, т.к. принимающая сторона (пока) не проверяет подпись.
        
        var securityKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("secret-key-must-be-at-least-16-chars"));
        var credentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(securityKey, Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256);
        
        // Пересоздаем хедер с алгоритмом
        header = new JwtHeader(credentials);

        // 4. Генерируем строку
        var responseToken = new JwtSecurityToken(header, payload);
        var responseString = handler.WriteToken(responseToken);

        // Рисуем форму авто-сабмита или кнопку
        var html = $@"
        <html>
        <body>
            <h1>Интерфейс Инструмента (Mock)</h1>
            <p>Задача выбрана. Нажмите кнопку, чтобы вернуться в HwProj.</p>
            <form method='POST' action='{returnUrl}'>
                <input type='hidden' name='JWT' value='{responseString}' />
                <button type='submit' style='font-size:20px; padding: 10px; cursor: pointer;'>Вернуть результат</button>
            </form>
        </body>
        </html>";

        return Content(html, "text/html");
    }
}