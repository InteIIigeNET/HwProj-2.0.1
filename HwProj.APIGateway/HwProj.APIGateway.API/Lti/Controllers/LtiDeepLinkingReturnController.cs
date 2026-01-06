using System.Collections.Generic;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens; // Убедитесь, что установлен пакет Microsoft.IdentityModel.Tokens

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti")]
[ApiController]
public class LtiDeepLinkingReturnController : ControllerBase
{
    // Инструмент отправляет форму с полем JWT на этот адрес
    [HttpPost("deepLinkReturn")]
    [AllowAnonymous] // Анонимно, так как запрос идет от браузера при редиректе из тула
    public IActionResult OnDeepLinkingReturn([FromForm] IFormCollection form)
    {
        // 1. Проверяем наличие параметра JWT
        if (!form.ContainsKey("JWT"))
        {
            return BadRequest("Missing JWT parameter");
        }

        string tokenString = form["JWT"]!;
        
        // 2. Разбиваем токен на части (Header.Payload.Signature)
        var parts = tokenString.Split('.');
        if (parts.Length != 3)
        {
            return BadRequest("Invalid JWT structure");
        }

        // В ПРОДАКШЕНЕ ЗДЕСЬ НУЖНА ВАЛИДАЦИЯ ПОДПИСИ (Signature)
        // Для этого нужно достать Public Key инструмента (JWKS) и проверить подпись.
        // Пока мы просто доверяем содержимому для тестов.

        // 3. Декодируем Payload из Base64Url
        string payloadJson;
        try
        {
            payloadJson = Base64UrlEncoder.Decode(parts[1]);
        }
        catch
        {
            return BadRequest("Invalid Base64 in JWT");
        }

        // 4. Парсим JSON вручную с помощью JsonDocument
        // Это самый надежный способ, который не падает из-за несовпадения типов C# классов.
        using var doc = JsonDocument.Parse(payloadJson);
        var root = doc.RootElement;
        
        // Имя поля по стандарту LTI 1.3 Deep Linking
        var itemsClaimName = "https://purl.imsglobal.org/spec/lti-dl/claim/content_items";
        
        var resultList = new List<object>();

        // 5. Ищем массив content_items
        if (root.TryGetProperty(itemsClaimName, out var itemsElement) && itemsElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var rawItem in itemsElement.EnumerateArray())
            {
                resultList.Add(rawItem.Clone().ToString());
            }
        }

        // Если список пуст (инструмент ничего не выбрал или формат неверен)
        if (resultList.Count == 0)
        {
            // Просто закрываем окно
            return Content("<script>window.close();</script>", "text/html");
        }

        // 6. Сериализуем список обратно в JSON для передачи на фронтенд HwProj
        var responsePayloadJson = JsonSerializer.Serialize(resultList);

        // 7. Генерируем HTML-страницу, которая передаст данные родительскому окну и закроется
        var htmlResponse = $@"
        <!DOCTYPE html>
        <html>
        <head><title>Processing LTI Return...</title></head>
        <body>
            <p>Задача выбрана. Возвращаемся в HwProj...</p>
            <script>
                // Данные из C#
                var payload = {responsePayloadJson};
                
                function sendAndClose() {{
                    // Проверяем, что окно было открыто как popup (есть opener)
                    if (window.opener) {{
                        // Отправляем сообщение (postMessage) в родительское окно
                        window.opener.postMessage({{
                            type: 'LTI_DEEP_LINK_SUCCESS', // Уникальный тип события, который слушает ваш React/Angular
                            payload: payload
                        }}, '*'); // В продакшене вместо '*' лучше указать домен HwProj
                    }}
                    
                    // Закрываем текущее окно (popup)
                    window.close();
                }}
                
                sendAndClose();
            </script>
        </body>
        </html>";

        return Content(htmlResponse, "text/html");
    }
}