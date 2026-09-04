using System;
using System.Collections.Generic;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Unicode;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.Configuration;
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
    private static readonly JwtSecurityTokenHandler Handler = new();

    [HttpPost("deepLinkReturn")]
    [AllowAnonymous]
    public async Task<IActionResult> OnDeepLinkingReturnAsync([FromForm] IFormCollection form)
    {
        if (!form.TryGetValue("JWT", out var jwtValue))
        {
            return BadRequest("Missing JWT parameter");
        }

        var tokenString = jwtValue.ToString();

        if (!Handler.CanReadToken(tokenString))
        {
            return BadRequest("Invalid JWT structure");
        }

        var unverifiedToken = Handler.ReadJwtToken(tokenString);
        var clientId = unverifiedToken.Issuer;

        var tool = toolService.GetByClientId(clientId);
        if (tool == null)
        {
            return Unauthorized($"Unknown tool clientId: {clientId}");
        }

        if (string.IsNullOrWhiteSpace(tool.LaunchUrl))
        {
            return BadRequest("Tool launch URL is not configured");
        }

        var signingKeys = await ltiKeyService.GetKeysAsync(tool.JwksEndpoint);
        JwtSecurityToken validatedToken;

        try
        {
            Handler.ValidateToken(tokenString, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = tool.ClientId,
                ValidateAudience = true,
                ValidAudience = ltiPlatformOptions.Value.Issuer,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(5),
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = signingKeys
            }, out var secToken);

            validatedToken = (JwtSecurityToken)secToken;
        }
        catch (Exception ex)
        {
            return BadRequest($"Token signature validation failed: {ex.Message}");
        }
        
        const string itemsClaimName = "https://purl.imsglobal.org/spec/lti-dl/claim/content_items";

        var itemsClaims = validatedToken.Claims
            .Where(c => c.Type == itemsClaimName)
            .Select(c => c.Value)
            .ToList();

        if (itemsClaims.Count == 0)
        {
            return Content("<script>window.close();</script>", "text/html");
        }

        var options = new JsonSerializerOptions
        {
            Encoder = JavaScriptEncoder.Create(UnicodeRanges.All)
        };

        var contentItems = new List<JsonNode?>();
        try
        {
            foreach (var itemsClaim in itemsClaims)
            {
                var parsedClaim = JsonNode.Parse(itemsClaim);
                if (parsedClaim is JsonArray itemsArray)
                {
                    foreach (var item in itemsArray)
                    {
                        contentItems.Add(ApplyLaunchUrlFallback(item, tool.LaunchUrl));
                    }
                }
                else
                {
                    contentItems.Add(ApplyLaunchUrlFallback(parsedClaim, tool.LaunchUrl));
                }
            }
        }
        catch (JsonException)
        {
            return BadRequest("Invalid content_items claim");
        }

        var jsonPayload = JsonSerializer.Serialize(contentItems, options);

        // language=html
        var htmlResponse = $@"
        <!DOCTYPE html>
        <html>
        <head><title>Processing LTI Return...</title></head>
        <body>
            <script type=""application/json"" id=""lti-payload"">
                {jsonPayload}
            </script>

            <script>
                try {{
                    let payloadElement = document.getElementById('lti-payload');
                    let payload = JSON.parse(payloadElement.textContent);

                    if (window.opener) {{
                        window.opener.postMessage({{
                            type: 'LTI_DEEP_LINK_SUCCESS',
                            payload: payload
                        }}, '*'); // В продакшене заменить '*' на конкретный домен
                    }}
                }} catch (e) {{
                    console.error('Ошибка обработки данных LTI:', e);
                }} finally {{
                    window.close();
                }}
            </script>
        </body>
        </html>";

        return Content(htmlResponse, "text/html");
    }

    private static JsonNode? ApplyLaunchUrlFallback(JsonNode? contentItem, string launchUrl)
    {
        if (contentItem is not JsonObject contentItemObject)
        {
            return contentItem;
        }

        var isLtiResourceLink = contentItemObject["type"] is JsonValue typeValue &&
                                typeValue.TryGetValue<string>(out var type) &&
                                string.Equals(type, "ltiResourceLink", StringComparison.Ordinal);

        if (!isLtiResourceLink)
        {
            return contentItemObject;
        }

        var hasLaunchUrl = contentItemObject["url"] is JsonValue urlValue &&
                           urlValue.TryGetValue<string>(out var url) &&
                           !string.IsNullOrWhiteSpace(url);

        if (!hasLaunchUrl)
        {
            contentItemObject["url"] = launchUrl;
        }

        return contentItemObject;
    }
}
