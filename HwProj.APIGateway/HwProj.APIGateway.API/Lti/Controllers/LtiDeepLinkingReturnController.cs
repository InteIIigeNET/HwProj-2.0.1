using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text.Json;
using LtiAdvantage.DeepLinking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti")]
[ApiController]
public class LtiDeepLinkingReturnController : ControllerBase
{
    [HttpPost("deepLinkReturn")]
    [AllowAnonymous]
    public IActionResult OnDeepLinkingReturn([FromForm] IFormCollection form)
    {
        if (!form.ContainsKey("JWT"))
        {
            return BadRequest("Missing JWT parameter");
        }

        string tokenString = form["JWT"]!;
        var handler = new JwtSecurityTokenHandler();

        if (!handler.CanReadToken(tokenString))
        {
            return BadRequest("Invalid JWT format");
        }

        // (добавить валидацию подписи)
        var jwtToken = handler.ReadJwtToken(tokenString);

        var ltiResponse = new LtiDeepLinkingResponse(jwtToken.Payload);

        var items = ltiResponse.ContentItems;

        if (items == null || items.Length == 0)
        {
            return Content("<script>window.close();</script>", "text/html");
        }

        var payloadList = items.Select(item => new 
        {
            title = !string.IsNullOrEmpty(item.Title) ? item.Title : "External Resource",
            url = item.Url,
            text = item.Text ?? ""
        }).ToList();

        var payloadJson = JsonSerializer.Serialize(payloadList);

        var htmlResponse = $@"
        <!DOCTYPE html>
        <html>
        <body>
            <script>
                var payload = {payloadJson};
                
                function sendAndClose() {{
                    if (window.opener) {{
                        window.opener.postMessage({{
                            type: 'LTI_DEEP_LINK_SUCCESS',
                            payload: payload
                        }}, '*');
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