using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using HwProj.APIGateway.API.Lti.Models;
using HwProj.APIGateway.API.LTI.Services;
using LtiAdvantage.DeepLinking;
using LtiAdvantage.Lti;
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
            Roles = [Role.ContextInstructor], 

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
}