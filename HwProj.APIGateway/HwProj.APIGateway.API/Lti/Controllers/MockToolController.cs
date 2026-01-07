using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http; // Добавлено
using System.Security.Cryptography;
using System.Text.Json;
using System.Threading.Tasks; // Добавлено
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

[Route("api/mocktool")]
[ApiController]
public class MockToolController : ControllerBase
{
    private static readonly RsaSecurityKey _signingKey;
    private static readonly string _keyId;
    
    // Добавляем фабрику для выполнения HTTP-запросов за ключами Платформы
    private readonly IHttpClientFactory _httpClientFactory;

    // Внедряем зависимость через конструктор
    public MockToolController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    static MockToolController()
    {
        var rsa = RSA.Create(2048);
        _keyId = Guid.NewGuid().ToString();
        _signingKey = new RsaSecurityKey(rsa) { KeyId = _keyId };
    }

    [HttpGet("jwks")]
    public IActionResult GetJwks()
    {
        var jwk = JsonWebKeyConverter.ConvertFromRSASecurityKey(_signingKey);
        return Ok(new { keys = new[] { jwk } });
    }

    [HttpPost("login")]
    public IActionResult Login([FromForm] string iss, [FromForm] string login_hint, [FromForm] string lti_message_hint)
    {
        var callbackUrl = $"{iss}/api/lti/authorize?" +
                          $"client_id=mock-tool-client-id&" +
                          $"response_type=id_token&" +
                          $"redirect_uri=http://localhost:5000/api/mocktool/callback&" +
                          $"login_hint={login_hint}&" +
                          $"lti_message_hint={lti_message_hint}&" +
                          $"scope=openid&state=xyz&nonce=123";

        return Redirect(callbackUrl);
    }

    // Делаем метод асинхронным (async Task)
    [HttpPost("callback")]
    public async Task<IActionResult> Callback([FromForm] string id_token)
    {
        var handler = new JwtSecurityTokenHandler();
        
        // 1. Читаем токен БЕЗ валидации, чтобы узнать, кто его прислал (Issuer)
        if (!handler.CanReadToken(id_token)) return BadRequest("Invalid Token");
        var unverifiedToken = handler.ReadJwtToken(id_token);
        
        string issuer = unverifiedToken.Issuer; // Это URL вашего HwProj (например, http://localhost:5000)

        // 2. Определяем адрес JWKS Платформы.
        // В реальном LTI этот URL часто передается при регистрации.
        // Для теста предположим, что HwProj отдает ключи по стандартному пути:
        string platformJwksUrl = $"{issuer}/api/lti/jwks"; 

        // 3. Скачиваем ключи Платформы
        var client = _httpClientFactory.CreateClient();
        string jwksJson;
        try 
        {
            jwksJson = await client.GetStringAsync(platformJwksUrl);
        }
        catch
        {
            return BadRequest($"Не удалось скачать ключи HwProj по адресу {platformJwksUrl}");
        }
        
        var platformKeySet = new JsonWebKeySet(jwksJson);

        // 4. ВАЛИДИРУЕМ ВХОДЯЩИЙ ТОКЕН ОТ ПЛАТФОРМЫ
        try
        {
            handler.ValidateToken(id_token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = issuer, // Токен должен быть от HwProj

                ValidateAudience = true,
                ValidAudience = "mock-tool-client-id", // Токен должен быть предназначен НАМ (этому инструменту)

                ValidateLifetime = true, // Не протух ли?

                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = platformKeySet.Keys // Проверяем подпись ключами Платформы
            }, out var validatedToken);
        }
        catch (Exception ex)
        {
            return Unauthorized($"Ошибка проверки подписи HwProj: {ex.Message}");
        }

        // --- Если мы здесь, токен от HwProj настоящий. Продолжаем логику ---

        var settingsClaim = unverifiedToken.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings");
        if (settingsClaim == null) return BadRequest("No deep linking settings found");

        var settings = JsonDocument.Parse(settingsClaim.Value);
        var returnUrl = settings.RootElement.GetProperty("deep_link_return_url").GetString();

        // Формируем ответ (как и раньше)
        var contentItems = new List<Dictionary<string, object>>
        {
            new()
            {
                ["type"] = "ltiResourceLink",
                ["title"] = "Тестовая Задача0 (Secure)",
                ["url"] = "http://localhost:5000/mock/task/0",
                ["text"] = "Задача проверена двусторонней подписью!",
                ["scoreMaximum"] = 15
            },
            new()
            {
                ["type"] = "ltiResourceLink",
                ["title"] = "Тестовая Задача1 (Secure)",
                ["url"] = "http://localhost:5000/mock/task/1",
                ["text"] = "Задача проверена двусторонней подписью!",
                ["scoreMaximum"] = 20
            }
        };

        var payload = new JwtPayload
        {
            { "iss", "http://localhost:5000" }, 
            { "aud", "mock-tool-client-id" }, // HwProj ожидает этот Audience (или свой ClientId, зависит от настроек HwProj)
            { "iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds() },
            { "exp", DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds() },
            { "nonce", "random-nonce-123" },
            { "https://purl.imsglobal.org/spec/lti-dl/claim/message_type", "LtiDeepLinkingResponse" },
            { "https://purl.imsglobal.org/spec/lti-dl/claim/version", "1.3.0" },
            { "https://purl.imsglobal.org/spec/lti-dl/claim/content_items", contentItems }
        };

        // Подписываем НАШ ответ НАШИМ ключом
        var credentials = new SigningCredentials(_signingKey, SecurityAlgorithms.RsaSha256);
        var header = new JwtHeader(credentials);
        var responseToken = new JwtSecurityToken(header, payload);
        var responseString = handler.WriteToken(responseToken);

        var html = $@"
        <html>
        <body>
            <h1>Tool Interface (Secure)</h1>
            <p style='color:green'>The incoming token from HwProj has been successfully verified!</p>
            <form method='POST' action='{returnUrl}'>
                <input type='hidden' name='JWT' value='{responseString}' />
                <button type='submit'>Return the result</button>
            </form>
        </body>
        </html>";

        return Content(html, "text/html");
    }
}