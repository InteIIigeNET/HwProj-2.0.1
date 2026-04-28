using System;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Encodings.Web;
using System.Text.Json;
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
        var clientId = unverifiedToken.Subject;

        var tool = toolService.GetByClientId(clientId);
        if (tool == null)
        {
            return Unauthorized($"Unknown tool clientId: {clientId}");
        }

        var signingKeys = await ltiKeyService.GetKeysAsync(tool.JwksEndpoint);
        JwtSecurityToken validatedToken;

        try
        {
            Handler.ValidateToken(tokenString, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = tool.issuer,
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

        string jsonPayload;
        var options = new JsonSerializerOptions
        {
            Encoder = JavaScriptEncoder.Create(UnicodeRanges.All)
        };

        if (itemsClaims.Count == 1)
        {
            var singleParsed = JsonSerializer.Deserialize<JsonElement>(itemsClaims[0]);

            jsonPayload = singleParsed.ValueKind == JsonValueKind.Array ?
                JsonSerializer.Serialize(singleParsed, options) : JsonSerializer.Serialize(new[] { singleParsed }, options);
        }
        else
        {
            var elements = itemsClaims
                .Select(v => JsonSerializer.Deserialize<JsonElement>(v))
                .ToList();
            jsonPayload = JsonSerializer.Serialize(elements, options);
        }

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
}