using System.Collections.Generic;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.Models;
using HwProj.APIGateway.API.Lti.Services;
using HwProj.APIGateway.API.LTI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti")]
[ApiController]
public class LtiAuthController(
    IOptions<LtiPlatformConfig> ltiPlatformOptions,
    ILtiToolService toolService,
    ILtiTokenService tokenService,
    IDataProtectionProvider provider
    ) 
    : ControllerBase
{
    private readonly IDataProtector protector = provider.CreateProtector("LtiPlatform.MessageHint.v1");

    // Tool редиректит сюда браузер (шаг "redirect browser to Platform for Auth")
    [HttpGet("authorize")]
    [AllowAnonymous]
    public async Task<IActionResult> AuthorizeLti(
        [FromQuery(Name = "client_id")] string clientId,
        [FromQuery(Name = "redirect_uri")] string redirectUri,
        [FromQuery(Name = "state")] string state,
        [FromQuery(Name = "nonce")] string nonce,
        [FromQuery(Name = "lti_message_hint")] string ltiMessageHint)
    {
        LtiHintPayload? payload;
        try
        {
            var json = this.protector.Unprotect(ltiMessageHint);
            payload = JsonSerializer.Deserialize<LtiHintPayload>(json);
        }
        catch
        {
            return BadRequest("Invalid or expired lti_message_hint");
        }

        if (payload == null)
        {
            return BadRequest("Invalid or expired lti_message_hint");
        }

        var tool = await toolService.GetByIdAsync(long.Parse(payload.ToolId!));
        if (tool == null)
        {
            return BadRequest("Tool not found");
        }

        if (tool.ClientId != clientId)
        {
            return BadRequest($"Invalid client_id. Expected: {tool.ClientId}, Got: {clientId}");
        }

        string idToken;
        if (payload.Type == "DeepLinking")
        {
            idToken = tokenService.CreateDeepLinkingToken(
                clientId: clientId,
                toolId: payload.ToolId,
                courseId: payload.CourseId,
                targetLinkUri: tool.DeepLink,
                userId:  payload.UserId,
                nonce: nonce
            );
        }
        else
        {
            // (Логика для обычного запуска, пока опустим)
            idToken = tokenService.CreateDeepLinkingToken(
                clientId: clientId,
                courseId: payload.CourseId,
                toolId: payload.ToolId,
                targetLinkUri: tool.DeepLink,
                userId:  payload.UserId,
                nonce: nonce
            );
        }

        var html = $"""
                    <!DOCTYPE html>
                    <html>
                      <body onload="document.forms[0].submit()">
                        <form method="post" action="{WebUtility.HtmlEncode(redirectUri)}">
                          <input type="hidden" name="id_token" value="{WebUtility.HtmlEncode(idToken)}" />
                          <input type="hidden" name="state" value="{WebUtility.HtmlEncode(state)}" />
                        </form>
                      </body>
                    </html>
                    """;

        return Content(html, "text/html");
    }

    [HttpGet("start")]
    [Authorize]
    public async Task<IActionResult> StartLti(
        [FromQuery] string? resourceLinkId,
        [FromQuery] string? courseId,
        [FromQuery] string? toolId,
        [FromQuery] bool isDeepLink = false)
    {
        var userId = User.FindFirstValue("_id");
        if (userId == null)
        {
            return Unauthorized("User ID not found");
        }

        LtiToolDto? tool;
        string targetUrl;
        LtiHintPayload payload;

        if (isDeepLink)
        {
            if (courseId == null || toolId == null)
            {
                return BadRequest("For Deep Linking, courseId and toolId are required.");
            }

            tool = await toolService.GetByIdAsync(long.Parse(toolId));
            if (tool == null)
            {
                return NotFound("Tool not found");
            }

            targetUrl = !string.IsNullOrEmpty(tool.DeepLink) 
                ? tool.DeepLink 
                : tool.LaunchUrl;

            payload = new LtiHintPayload
            {
                Type = "DeepLinking",
                UserId = userId,
                CourseId = courseId,
                ToolId = toolId
            };
        }
        else if (!string.IsNullOrEmpty(resourceLinkId))
        {
            // Здесь логика поиска тула может быть сложнее (через LinkService)
            tool = await toolService.GetByIdAsync(1);

            if (tool == null)
            {
                return NotFound("Tool not found");
            }

            targetUrl = tool.LaunchUrl;

            payload = new LtiHintPayload
            {
                Type = "ResourceLink",
                UserId = userId,
                ResourceLinkId = resourceLinkId
            };
        }
        else
        {
            return BadRequest("Either resourceLinkId OR (isDeepLink + courseId + toolId) must be provided.");
        }

        var json = JsonSerializer.Serialize(payload);
        var messageHint = this.protector.Protect(json);

        var dto = new AuthorizePostFormDto()
        {
            ActionUrl = tool.InitiateLoginUri,
            Method = "POST",
            Fields = new Dictionary<string, string>
            {
                ["iss"] = ltiPlatformOptions.Value.Issuer,
                ["login_hint"] = userId,
                ["target_link_uri"] = targetUrl,
                ["lti_message_hint"] = messageHint,
                ["client_id"] = tool.ClientId,
            }
        };

        return Ok(dto);
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

    private class LtiHintPayload
    {
        public string Type { get; set; }
        public string UserId { get; set; }
        public string? ResourceLinkId { get; set; }
        public string? CourseId { get; set; }
        public string? ToolId { get; set; }
    }
}