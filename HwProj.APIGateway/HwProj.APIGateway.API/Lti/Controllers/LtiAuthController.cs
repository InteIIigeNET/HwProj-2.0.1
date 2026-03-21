using System.Collections.Generic;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.Configuration;
using HwProj.APIGateway.API.Lti.DTOs;
using HwProj.APIGateway.API.Lti.Services;
using HwProj.APIGateway.API.LTI.Services;
using HwProj.CoursesService.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti")]
[ApiController]
public class LtiAuthController(
    ICoursesServiceClient coursesServiceClient,
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

        if (payload?.ToolName == null || payload.CourseId == null)
        {
            return BadRequest("Invalid or expired lti_message_hint");
        }

        var tool = toolService.GetByName(payload.ToolName);
        if (tool == null)
        {
            return BadRequest("Tool not found");
        }

        if (tool.ClientId != clientId)
        {
            return BadRequest($"Invalid clientId. Expected: {tool.ClientId}, Got: {clientId}");
        }

        var course = await coursesServiceClient.GetCourseByIdForLti(long.Parse(payload.CourseId));
        if (course == null)
        {
            return NotFound("Course not found");
        }

        if (course.LtiToolName != tool.Name)
        {
            return BadRequest("The data is incorrect: the id of the instrument linked to the exchange rate does not match");
        }

        string idToken;
        switch (payload.Type)
        {
            case "DeepLinking":
                idToken = tokenService.CreateDeepLinkingToken(
                    clientId: clientId,
                    courseId: payload.CourseId,
                    targetLinkUri: redirectUri,
                    userId:  payload.UserId,
                    nonce: nonce
                );
                break;
            case "ResourceLink":
                idToken = tokenService.CreateResourceLinkToken(
                    clientId: clientId,
                    courseId: payload.CourseId,
                    targetLinkUri: redirectUri,
                    ltiCustomParams: payload.Custom,
                    userId: payload.UserId,
                    nonce: nonce,
                    resourceLinkId: payload.ResourceLinkId!);
                break;
            default:
                return BadRequest("Invalid or expired lti_message_hint");
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
        [FromQuery] string? toolName,
        [FromQuery] string? ltiLaunchUrl,
        [FromQuery] string? ltiCustomParams,
        [FromQuery] bool isDeepLink = false)
    {
        var userId = User.FindFirstValue("_id");
        if (userId == null)
        {
            return Unauthorized("User ID not found");
        }

        string targetUrl;
        LtiHintPayload payload;

        if (courseId == null || toolName == null)
        {
            return BadRequest("For Deep Linking, courseId and toolId are required.");
        }

        var tool = toolService.GetByName(toolName);
        if (tool == null)
        {
            return NotFound("Tool not found");
        }

        var course = await coursesServiceClient.GetCourseByIdForLti(long.Parse(courseId));
        if (course == null)
        {
            return NotFound("Course not found");
        }

        if (course.LtiToolName != toolName)
        {
            return BadRequest("The data is incorrect: the id of the instrument linked to the exchange rate does not match");
        }

        if (isDeepLink)
        {
            targetUrl = !string.IsNullOrEmpty(tool.DeepLink) 
                ? tool.DeepLink 
                : tool.LaunchUrl;

            payload = new LtiHintPayload
            {
                Type = "DeepLinking",
                UserId = userId,
                CourseId = courseId,
                ToolName = toolName
            };
        }
        else if (!string.IsNullOrEmpty(resourceLinkId) && !string.IsNullOrEmpty(ltiLaunchUrl))
        {
            targetUrl = ltiLaunchUrl;

            payload = new LtiHintPayload
            {
                Type = "ResourceLink",
                UserId = userId,
                CourseId = courseId,
                ToolName = toolName,
                ResourceLinkId = resourceLinkId,
                Custom =  ltiCustomParams
            };
        }
        else
        {
            return BadRequest("Either resourceLinkId OR (isDeepLink + courseId + toolId) must be provided.");
        }

        var json = JsonSerializer.Serialize(payload);
        var messageHint = this.protector.Protect(json);

        var dto = new AuthorizePostFormDto(
            tool.InitiateLoginUri,
            "POST",
            new Dictionary<string, string>
            {
                ["iss"] = ltiPlatformOptions.Value.Issuer,
                ["login_hint"] = userId,
                ["target_link_uri"] = targetUrl,
                ["lti_message_hint"] = messageHint,
                ["client_id"] = tool.ClientId,
            });

        return Ok(dto);
    }

    [HttpGet("closeLtiSession")]
    public IActionResult CloseLtiSession()
    {
        const string htmlContent = @"
    <!DOCTYPE html>
    <html lang='ru'>
    <head>
        <meta charset='UTF-8'>
        <title>Сессия завершена</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; text-align: center; padding-top: 50px; background-color: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block; }
            button { padding: 10px 20px; background-color: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
            button:hover { background-color: #115293; }
        </style>
        <script>
            window.onload = function() {
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage('lti_success_refresh', '*');
                }

                window.close();
            };
        </script>
    </head>
    <body>
        <div class='container'>
            <h3>Работа с инструментом завершена</h3>
            <p>Вкладка должна закрыться автоматически, а страница задачи обновиться.</p>
            <p>Если этого не произошло, нажмите кнопку ниже:</p>
            <button onclick='window.close()'>Закрыть вкладку</button>
        </div>
    </body>
    </html>";

        return Content(htmlContent, "text/html");
    }

    private class LtiHintPayload
    {
        public string Type { get; set; }
        public string UserId { get; set; }
        public string? ResourceLinkId { get; set; }
        public string? CourseId { get; set; }
        public string? ToolName { get; set; }
        public string? Custom { get; set; }
    }
}