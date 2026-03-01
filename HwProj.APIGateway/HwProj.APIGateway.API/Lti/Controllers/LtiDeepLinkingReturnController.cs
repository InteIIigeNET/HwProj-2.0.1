using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.Models;
using HwProj.APIGateway.API.Lti.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti")]
[ApiController]
public class LtiDeepLinkingReturnController(
    IOptions<LtiPlatformConfig> ltiPlatformOptions,
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
        var clientId = unverifiedToken.Issuer;

        var tool = await toolService.GetByClientIdAsync(clientId);
        if (tool == null)
        {
            return Unauthorized($"Unknown tool clientId: {clientId}");
        }

        var signingKeys = await ltiKeyService.GetKeysAsync(tool.JwksEndpoint);

        try
        {
            handler.ValidateToken(tokenString, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = unverifiedToken.Issuer,

                ValidateAudience = true,
                ValidAudience = ltiPlatformOptions.Value.Issuer,

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
                var payload = {responsePayloadJson};
                
                function sendAndClose() {{
                    if (window.opener) {{
                        window.opener.postMessage({{
                            type: 'LTI_DEEP_LINK_SUCCESS', // Уникальный тип события, который слушает ваш React/Angular
                            payload: payload
                        }}, '*'); // В продакшене вместо '*' лучше указать домен HwProj
                    }}
                    
                    window.close();
                }}
                
                sendAndClose();
            </script>
        </body>
        </html>";

        return Content(htmlResponse, "text/html");
    }
}