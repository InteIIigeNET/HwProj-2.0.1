using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti")]
[ApiController]
public class LtiDeepLinkingReturnController(
    ILtiToolService toolService,
    ILtiKeyService ltiKeyService
    ) : ControllerBase
{
    [HttpPost("deepLinkReturn")]
    [AllowAnonymous]
    public async Task<IActionResult> OnDeepLinkingReturnAsync([FromForm] IFormCollection form)
    {
        if (!form.ContainsKey("JWT"))
        {
            return BadRequest("Missing JWT parameter");
        }

        string tokenString = form["JWT"]!;
        var handler = new JwtSecurityTokenHandler();

        if (!handler.CanReadToken(tokenString))
        {
            return BadRequest("Invalid JWT structure");
        }

        var unverifiedToken = handler.ReadJwtToken(tokenString);
        var issuer = unverifiedToken.Issuer;

        // 2. Ищем инструмент в БД по Issuer
        // (Предполагается, что у toolService есть метод GetByIssuerAsync или аналогичный)
        var tool = await toolService.GetByIssuerAsync(issuer);
        if (tool == null)
        {
            return Unauthorized($"Unknown tool issuer: {issuer}");
        }

        // 3. Получаем публичные ключи (JWKS) инструмента через сервис
        var signingKeys = await ltiKeyService.GetKeysAsync(tool.JwksEndpoint);

        // 4. Валидируем подпись
        try
        {
            handler.ValidateToken(tokenString, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = issuer,

                ValidateAudience = true,
                ValidAudience = tool.ClientId,

                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(5),

                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = signingKeys
            }, out var validatedToken);
        }
        catch (Exception ex)
        {
            return BadRequest($"Token signature validation failed: {ex.Message}");
        }
        
        const string itemsClaimName = "https://purl.imsglobal.org/spec/lti-dl/claim/content_items";
        
        var resultList = new List<object>();

        if (unverifiedToken.Payload.TryGetValue(itemsClaimName, out var itemsObject))
        {
            var jsonString = itemsObject.ToString();
            if (!string.IsNullOrEmpty(jsonString))
            {
                using var doc = JsonDocument.Parse(jsonString);
                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var rawItem in doc.RootElement.EnumerateArray())
                    {
                        resultList.Add(rawItem.Clone().ToString());
                    }
                }
            }
        }

        if (resultList.Count == 0)
        {
            return Content("<script>window.close();</script>", "text/html");
        }

        var responsePayloadJson = JsonSerializer.Serialize(resultList);

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