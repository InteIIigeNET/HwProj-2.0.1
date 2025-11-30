using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.LTI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti/launch")]
[ApiController]
public class LtiAuthController(ILtiTokenService tokenService) : ControllerBase
{
    private readonly ILtiTokenService _tokenService = tokenService;

    // Tool редиректит сюда браузер (шаг "redirect browser to Platform for Auth")
    [HttpPost("authorize")]
    [Authorize] // пользователь должен быть залогинен в LMS
    public async Task<IActionResult> AuthorizeLti(
        [FromQuery] string issOfTheTool,
        [FromQuery] string clientId,
        [FromQuery] string targetLinkUri,
        [FromQuery] string state,
        [FromQuery] string nonce,
        [FromQuery(Name = "login_hint")] string loginId,
        [FromQuery(Name = "lti_message_hint")] string ltiMessageHint)
    {
        // 1. ПРОВЕРКА ЗАПРОСА (validate request)
        if (!(await this.CheckTheRequest(issOfTheTool, clientId,  targetLinkUri, loginId)))
        {
            return BadRequest();
        }

        // 2. СОЗДАНИЕ id_token (LTI JWT)
        var idToken = _tokenService.CreateLtiIdToken(
            user: User,
            clientId: clientId,
            redirectUri: targetLinkUri,
            nonce: nonce,
            ltiMessageHint: ltiMessageHint);

        // 3. ВОЗВРАТ auth response (redirect auth response to tool)
        var html = $"""

                    <!DOCTYPE html>
                    <html>
                      <body onload="document.forms[0].submit()">
                        <form method="post" action="{WebUtility.HtmlEncode(targetLinkUri)}">
                          <input type="hidden" name="id_token" value="{WebUtility.HtmlEncode(idToken)}" />
                          <input type="hidden" name="state" value="{WebUtility.HtmlEncode(state)}" />
                          <noscript>
                            <p>JavaScript отключён. Нажмите кнопку, чтобы продолжить.</p>
                            <button type="submit">Продолжить</button>
                          </noscript>
                        </form>
                      </body>
                    </html>
                    """;
        return Content(html, "text/html");
    }

    private async Task<bool> CheckTheRequest(
        string issOfTheTool,
        string clientId,
        string redirectUri,
        string loginHint)
    {
        // - client_id существует и соответствует зарегистрированному Tool
        // - redirect_uri допустим
        // - пользователь аутентифицирован (Authorize уже проверил)
        // - можешь сверить login_hint с текущим пользователем и т.д.
        return true;
    }
}