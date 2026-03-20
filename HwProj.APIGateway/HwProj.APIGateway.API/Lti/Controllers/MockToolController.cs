#if DEBUG
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using System.Threading.Tasks;
using LtiAdvantage.AssignmentGradeServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/mocktool")]
[ApiController]
public class MockToolController(IHttpClientFactory httpClientFactory) : ControllerBase
{
    private static readonly RsaSecurityKey SigningKey;

    private const string ToolIss = "Local Mock Tool";
    private const string ToolNameId = "mock-tool-client-id";

    private record MockTask(string Id, string Title, string Description, int Score);
    private static readonly List<MockTask> AvailableTasks =
    [
        new MockTask("1", "Integrals (Mock)", "Calculate definite integral", 10),
        new MockTask("2", "Derivatives (Mock)", "Find the derivative of a complex function", 5),
        new MockTask("3", "Limits (Mock)", "Calculate sequence limit", 8),
        new MockTask("4", "Series (Mock)", "Investigate series for convergence", 12),
        new MockTask("5", "Diff. Eqs (Mock)", "Solve linear equation", 15)
    ];

    static MockToolController()
    {
        var rsa = RSA.Create(2048);
        var keyId = "mock-tool-key-id";
        SigningKey = new RsaSecurityKey(rsa) { KeyId = keyId };
    }

    [HttpGet("jwks")]
    public IActionResult GetJwks()
    {
        var jwk = JsonWebKeyConverter.ConvertFromRSASecurityKey(SigningKey);
        return Ok(new { keys = new[] { jwk } });
    }

    [HttpPost("login")]
    public IActionResult Login([FromForm] string iss, [FromForm] string login_hint, [FromForm] string lti_message_hint)
    {
        var callbackUrl = $"{iss}/api/lti/authorize?" +
                          $"client_id={ToolNameId}&" +
                          $"response_type=id_token&" +
                          $"redirect_uri=http://localhost:5000/api/mocktool/callback&" +
                          $"login_hint={login_hint}&" +
                          $"lti_message_hint={lti_message_hint}&" +
                          $"scope=openid&state=xyz&nonce={Guid.NewGuid()}";

        return Redirect(callbackUrl);
    }

    [HttpPost("callback")]
    public async Task<IActionResult> Callback([FromForm] string id_token)
    {
        var handler = new JwtSecurityTokenHandler();
        if (!handler.CanReadToken(id_token)) return BadRequest("Invalid Token");
        var unverifiedToken = handler.ReadJwtToken(id_token);

        var issuer = unverifiedToken.Issuer;
        var platformJwksUrl = $"{issuer}/api/lti/jwks";

        var client = httpClientFactory.CreateClient();
        string jwksJson;
        try {
            jwksJson = await client.GetStringAsync(platformJwksUrl);
        } catch {
            return BadRequest($"Failed to download HwProj keys from {platformJwksUrl}");
        }

        var platformKeySet = new JsonWebKeySet(jwksJson);

        try {
            handler.ValidateToken(id_token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = ToolNameId,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = platformKeySet.Keys
            }, out _);
        } catch (Exception ex) {
            return Unauthorized($"HwProj signature validation error: {ex.Message}");
        }

        var messageType = unverifiedToken.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti/claim/message_type")?.Value;

        return messageType switch
        {
            "LtiDeepLinkingRequest" => RenderDeepLinkingSelectionUI(unverifiedToken),
            "LtiResourceLinkRequest" => HandleResourceLink(unverifiedToken),
            _ => BadRequest($"Unknown message type: {messageType}")
        };
    }

    private IActionResult RenderDeepLinkingSelectionUI(JwtSecurityToken token)
    {
        var settingsClaim = token.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings");
        if (settingsClaim == null) return BadRequest("No deep linking settings found");

        var settings = JsonDocument.Parse(settingsClaim.Value);
        var returnUrl = settings.RootElement.GetProperty("deep_link_return_url").GetString();
        var dataPayload = settings.RootElement.TryGetProperty("data", out var dataEl) ? dataEl.GetString() : "";

        var tasksHtml = string.Join("", AvailableTasks.Select(t => $@"
            <div class='task-item'>
                <label>
                    <input type='checkbox' name='selectedIds' value='{t.Id}' />
                    <span class='title'>{t.Title}</span>
                    <span class='score'>({t.Score} points)</span>
                </label>
            </div>"));

        var html = $@"
        <html>
        <body style='font-family: sans-serif; padding: 20px;'>
            <h2>Select Tasks for HwProj</h2>
            <form action='/api/mocktool/submit-selection' method='POST'>
                <input type='hidden' name='returnUrl' value='{returnUrl}' />
                <input type='hidden' name='data' value='{dataPayload}' />
                <input type='hidden' name='platformIssuer' value='{token.Issuer}' />
                {tasksHtml}
                <br/><button type='submit' style='padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer;'>Import</button>
            </form>
        </body>
        </html>";

        return Content(html, "text/html");
    }

    [HttpPost("submit-selection")]
    public IActionResult SubmitDeepLinkingSelection(
        [FromForm] List<string> selectedIds, 
        [FromForm] string returnUrl,
        [FromForm] string? data,
        [FromForm] string platformIssuer)
    {
        var selectedTasks = AvailableTasks.Where(t => selectedIds.Contains(t.Id)).ToList();

        var contentItems = selectedTasks.Select(t => new Dictionary<string, object>
        {
            ["type"] = "ltiResourceLink",
            ["title"] = t.Title,
            ["text"] = t.Description,
            ["url"] = $"http://localhost:5000/mock/task/{t.Id}", 

            ["lineItem"] = new Dictionary<string, object> 
            {
                ["scoreMaximum"] = t.Score,
                ["label"] = t.Title
            },

            ["custom"] = new Dictionary<string, string>
            {
                { "internal_task_id", t.Id }
            }

        }).ToList();

        var payload = new JwtPayload
        {
            { "iss", ToolIss },
            { "sub", ToolNameId },
            { "aud", platformIssuer },
            { "iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds() },
            { "exp", DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds() },
            { "nonce", Guid.NewGuid().ToString() },
            { "https://purl.imsglobal.org/spec/lti-dl/claim/message_type", "LtiDeepLinkingResponse" },
            { "https://purl.imsglobal.org/spec/lti-dl/claim/version", "1.3.0" },
            { "https://purl.imsglobal.org/spec/lti-dl/claim/content_items", contentItems }
        };

        if (!string.IsNullOrEmpty(data))
            payload.Add("https://purl.imsglobal.org/spec/lti-dl/claim/data", data);

        var credentials = new SigningCredentials(SigningKey, SecurityAlgorithms.RsaSha256);
        var header = new JwtHeader(credentials);
        var responseToken = new JwtSecurityToken(header, payload);
        var responseString = new JwtSecurityTokenHandler().WriteToken(responseToken);

        var html = $@"
        <html>
        <body onload='document.forms[0].submit()'>
            <form method='POST' action='{returnUrl}'>
                <input type='hidden' name='JWT' value='{responseString}' />
            </form>
        </body>
        </html>";

        return Content(html, "text/html");
    }

    private IActionResult HandleResourceLink(JwtSecurityToken token)
    {
        var presentationClaim = token.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti/claim/launch_presentation");
        var presentationJson = JsonDocument.Parse(presentationClaim?.Value ?? "{}");
        var returnUrl = presentationJson.RootElement.TryGetProperty("return_url", out var rProp) ? rProp.GetString() : "";

        var customClaim = token.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti/claim/custom");
        var customJson = JsonDocument.Parse(customClaim?.Value ?? "{}");

        string toolTaskId = null;
        if (customJson.RootElement.TryGetProperty("internal_task_id", out var idProp))
        {
            toolTaskId = idProp.GetString();
        }

        if (string.IsNullOrEmpty(toolTaskId))
        {
             var resourceLinkClaim = token.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti/claim/resource_link");
             toolTaskId = JsonDocument.Parse(resourceLinkClaim?.Value ?? "{}").RootElement.GetProperty("id").GetString();
        }

        var currentTask = AvailableTasks.FirstOrDefault(t => t.Id == toolTaskId);

        var scoreToDisplay = currentTask?.Score ?? 0;
        var titleToDisplay = currentTask?.Title ?? $"Task ID: {toolTaskId} (Not Found)";
        var descToDisplay = currentTask?.Description ?? "Description not available";

        var agsClaim = token.Claims.FirstOrDefault(c => c.Type == "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint");
        var lineItemUrl = JsonDocument.Parse(agsClaim?.Value ?? "{}").RootElement.GetProperty("lineitem").GetString();

        var html = $@"
        <html>
        <body style='text-align: center; padding: 50px; font-family: sans-serif;'>
            <h1>Performing: {titleToDisplay}</h1>
            <p>{descToDisplay}</p>
            <form action='/api/mocktool/send-score' method='POST'>
                <input type='hidden' name='lineItemUrl' value='{lineItemUrl}' />
                <input type='hidden' name='userId' value='{token.Subject}' />
                <input type='hidden' name='platformIss' value='{token.Issuer}' />
                <!-- Отправляем именно наш внутренний ID -->
                <input type='hidden' name='taskId' value='{toolTaskId}' />
                <input type='hidden' name='returnUrl' value='{returnUrl}' />
                
                <button type='submit' style='background: #007bff; color: white; padding: 15px 30px; font-size: 18px; border: none; border-radius: 5px; cursor: pointer;'>
                    Submit solution for {scoreToDisplay} points
                </button>
            </form>
        </body>
        </html>";

        return Content(html, "text/html");
    }

    [HttpPost("send-score")]
    public async Task<IActionResult> SendScore(
        [FromForm] string lineItemUrl, [FromForm] string userId, 
        [FromForm] string platformIss, [FromForm] string taskId, [FromForm] string returnUrl)
    {
        var currentTask = AvailableTasks.FirstOrDefault(t => t.Id == taskId);

        if (currentTask == null)
        {
            return BadRequest($"Task with internal ID '{taskId}' not found in the tool database. (Check if DeepLinking passed custom params correctly)");
        }

        var client = httpClientFactory.CreateClient();
        var clientAssertion = CreateClientAssertion(platformIss);

        var tokenRequest = new Dictionary<string, string> {
            ["grant_type"] = "client_credentials",
            ["client_assertion_type"] = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            ["client_assertion"] = clientAssertion,
            ["scope"] = "https://purl.imsglobal.org/spec/lti-ags/scope/score"
        };

        var tokenResponse = await client.PostAsync($"{platformIss}/api/lti/token", new FormUrlEncodedContent(tokenRequest));
        if (!tokenResponse.IsSuccessStatusCode) return BadRequest($"Error retrieving token from {platformIss}");

        var tokenContent = await tokenResponse.Content.ReadAsStringAsync();
        var accessToken = JsonDocument.Parse(tokenContent).RootElement.GetProperty("access_token").GetString();

        var scoreObj = new Score {
            UserId = userId,
            ScoreGiven = currentTask.Score, 
            ScoreMaximum = currentTask.Score, 
            Comment = $"Excellent! Task '{currentTask.Title}' completed.",
            GradingProgress = GradingProgress.FullyGraded,
            ActivityProgress = ActivityProgress.Completed,
            TimeStamp = DateTime.UtcNow
        };

        var scoreRequest = new HttpRequestMessage(HttpMethod.Post, $"{lineItemUrl}/scores") {
            Content = new StringContent(JsonSerializer.Serialize(scoreObj), System.Text.Encoding.UTF8, "application/vnd.ims.lti-ags.v1.score+json")
        };
        scoreRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var scoreResponse = await client.SendAsync(scoreRequest);

        var statusColor = scoreResponse.IsSuccessStatusCode ? "green" : "red";
        var statusText = scoreResponse.IsSuccessStatusCode 
            ? $"Score of {currentTask.Score} successfully submitted!" 
            : $"Error submitting score: {scoreResponse.StatusCode}";

        var html = $@"
        <html>
        <head>
            <style>
                body {{ font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f4f7f6; }}
                .card {{ background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }}
                h2 {{ margin: 0 0 10px; color: {statusColor}; }}
                p {{ color: #666; margin-bottom: 30px; }}
                .btn {{ text-decoration: none; background: #007bff; color: white; padding: 12px 24px; border-radius: 6px; font-weight: bold; }}
            </style>
            <meta http-equiv='refresh' content='3;url={returnUrl}'>
        </head>
        <body>
            <div class='card'>
                <h2>{statusText}</h2>
                <p>You will be redirected back to HwProj in 3 seconds...</p>
                <a href='{returnUrl}' class='btn'>Return Now</a>
            </div>
        </body>
        </html>";

        return Content(html, "text/html");
    }

    private static string CreateClientAssertion(string platformIssuer)
    {
        var claims = new List<Claim> {
            new(JwtRegisteredClaimNames.Iss, ToolIss),
            new(JwtRegisteredClaimNames.Sub, ToolNameId),
            new(JwtRegisteredClaimNames.Aud, $"{platformIssuer}/api/lti/token"),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new(JwtRegisteredClaimNames.Exp, DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var jwt = new JwtSecurityToken(
            header: new JwtHeader(new SigningCredentials(SigningKey, SecurityAlgorithms.RsaSha256)),
            payload: new JwtPayload(claims)
        );

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}
#endif