using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using HwProj.APIGateway.API.Lti.Models;
using HwProj.APIGateway.API.LTI.Services;
using LtiAdvantage.DeepLinking;
using LtiAdvantage.Lti;
using LtiAdvantage.AssignmentGradeServices;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.APIGateway.API.Lti.Services;

public class LtiTokenService(IOptions<LtiPlatformConfig> options) : ILtiTokenService
{
    private readonly LtiPlatformConfig _options = options.Value;

    public string CreateDeepLinkingToken(
        string clientId,
        string toolId,
        string courseId,
        string targetLinkUri,
        string userId,
        string nonce)
    {
        var request = new LtiDeepLinkingRequest
        {
            DeploymentId = toolId,
            Nonce = nonce,
            UserId = userId,
            TargetLinkUri = targetLinkUri, 
            Roles = [Role.ContextInstructor, Role.InstitutionInstructor], 

            Context = new ContextClaimValueType
            {
                Id = courseId
            },

            DeepLinkingSettings = new DeepLinkingSettingsClaimValueType
            {
                AutoCreate = true,
                AcceptMultiple = true,
                AcceptTypes = ["ltiResourceLink"],
                AcceptPresentationDocumentTargets = [DocumentTarget.Window],
            
                DeepLinkReturnUrl = this._options.DeepLinkReturnUrl, 
            }
        };

        return this.CreateJwt(clientId, request);
    }

    public string CreateResourceLinkToken(
        string clientId,
        string toolId,
        string courseId,
        string targetLinkUri,
        string? ltiCustomParams,
        string userId,
        string nonce,
        string resourceLinkId)
    {
        var request = new LtiResourceLinkRequest
        {
            DeploymentId = toolId,
            Nonce = nonce,
            UserId = userId,
            TargetLinkUri = targetLinkUri,

            Roles = [Role.ContextLearner, Role.InstitutionStudent],

            Context = new ContextClaimValueType
            {
                Id = courseId
            },

            ResourceLink = new ResourceLinkClaimValueType
            {
                Id = resourceLinkId
            },

            LaunchPresentation = new LaunchPresentationClaimValueType
            {
                DocumentTarget = DocumentTarget.Window,
                ReturnUrl = _options.ResourceLinkReturnUrl,
            },

            AssignmentGradeServices = new AssignmentGradeServicesClaimValueType
            {
                Scope = ["https://purl.imsglobal.org/spec/lti-ags/scope/score"],
                LineItemUrl = _options.AssignmentsGradesEndpoint + "/" + resourceLinkId,
            }
        };

        if (string.IsNullOrEmpty(ltiCustomParams))
        {
            request.Custom = new Dictionary<string, string>();
            return this.CreateJwt(clientId, request);
        }

        try
        {
            request.Custom = JsonSerializer.Deserialize<Dictionary<string, string>>(ltiCustomParams);
        }
        catch (JsonException)
        {
            request.Custom = new Dictionary<string, string>();
        }

        return this.CreateJwt(clientId, request);
    }

    public string GenerateAccessTokenForLti(string clientId, string scope)
    {
        var now = DateTime.UtcNow;

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, clientId),
            
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),

            new Claim("scope", scope)
        };

        var jwt = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Issuer,
            claims: claims,
            notBefore: now,
            expires: now.AddHours(1),
            signingCredentials: GetSigningCredentials()
        );

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }


    private SigningCredentials GetSigningCredentials()
    {
        var keyConfig = _options.SigningKey;

        var rsa = RSA.Create();
        
        rsa.ImportFromPem(keyConfig.PrivateKeyPem);

        var securityKey = new RsaSecurityKey(rsa)
        {
            KeyId = keyConfig.KeyId
        };

        return new SigningCredentials(securityKey, SecurityAlgorithms.RsaSha256);
    }

    private string CreateJwt(string clientId, LtiRequest request)
    {
        var now = DateTime.UtcNow;
        var jwt = new JwtSecurityToken(
            issuer: this._options.Issuer,
            audience: clientId,
            claims: request.IssuedClaims,
            notBefore: now,
            expires: now.AddMinutes(5),
            signingCredentials: GetSigningCredentials()
        );

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}