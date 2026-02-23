using System;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Lti.Services;
using HwProj.APIGateway.API.LTI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.APIGateway.API.Lti.Controllers;

[Route("api/lti")]
[ApiController]
public class LtiAccessTokenController(
    ILtiToolService toolService,
    ILtiKeyService ltiKeyService,
    ILtiTokenService tokenService
    ) : ControllerBase
{
    [HttpPost("token")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTokenAsync([FromForm] IFormCollection form)
    {
        if (!form.TryGetValue("grant_type", out var grantType) || grantType != "client_credentials")
        {
            return BadRequest(new { error = "unsupported_grant_type", error_description = "Only 'client_credentials' is supported." });
        }

        if (!form.TryGetValue("client_assertion_type", out var assertionType) ||
            assertionType != "urn:ietf:params:oauth:client-assertion-type:jwt-bearer")
        {
            return BadRequest(new { error = "invalid_request", error_description = "Invalid client_assertion_type." });
        }

        if (!form.TryGetValue("client_assertion", out var clientAssertion))
        {
            return BadRequest(new { error = "invalid_request", error_description = "Missing client_assertion." });
        }

        var handler = new JwtSecurityTokenHandler();
        if (!handler.CanReadToken(clientAssertion))
        {
            return BadRequest(new { error = "invalid_client", error_description = "Invalid JWT structure." });
        }

        var unverifiedToken = handler.ReadJwtToken(clientAssertion);

        var issuer = unverifiedToken.Issuer;

        var tool = await toolService.GetByIssuerAsync(issuer);
        if (tool == null)
        {
            return Unauthorized(new { error = "invalid_client", error_description = $"Unknown issuer: {issuer}" });
        }

        var signingKeys = await ltiKeyService.GetKeysAsync(tool.JwksEndpoint);

        try
        {
            var tokenEndpointUrl = $"{Request.Scheme}://{Request.Host}{Request.Path}";

            handler.ValidateToken(clientAssertion, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = issuer,

                ValidateAudience = true,
                ValidAudience = tokenEndpointUrl,

                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(5),

                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = signingKeys
            }, out _);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { error = "invalid_client", error_description = $"Token validation failed: {ex.Message}" });
        }

        const string scope = "https://purl.imsglobal.org/spec/lti-ags/scope/score";

        var accessToken = tokenService.GenerateAccessTokenForLti(tool.ClientId, scope);

        return Ok(new
        {
            access_token = accessToken,
            token_type = "Bearer",
            expires_in = 3600,
            scope
        });
    }
}