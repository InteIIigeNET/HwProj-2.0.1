using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HwProj.APIGateway.API.LTI.Services;
using LtiAdvantage.Lti;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.APIGateway.API.Lti.Services;

public class LtiTokenService(IOptions<LtiOptions> options) : ILtiTokenService
{
    private readonly LtiOptions _options = options.Value;
    private readonly JwtSecurityTokenHandler _tokenHandler = new();

    public string CreateLtiIdToken(
        ClaimsPrincipal user,
        string clientId,
        string redirectUri,
        string nonce,
        string ltiMessageHint)
    {
        // время жизни токена
        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(this._options.TokenLifetimeMinutes);

        var signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(this._options.SigningKey));    
        var signingCredentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.RsaSha256);

        ContextClaimValueType context = new();
        /*context.Id = ;
        context.Label = ;
        context.Title = ;
        context.Type = ; */   

        ResourceLinkClaimValueType  resourceLink = new();
        /*resourceLink.Id = ;
        resourceLink.Description = ;
        resourceLink.Title = ;*/

        // ???
        LaunchPresentationClaimValueType launchPresentation = new();
        
        var request = new LtiResourceLinkRequest
        {
            DeploymentId = _options.DeploymentId,
            Nonce = nonce,
            // обязательные LTI claims:
            Roles = [Role.InstitutionStudent],
            Context = context,
            ResourceLink = resourceLink,
            TargetLinkUri = redirectUri,
            // opaque user id внутри платформы
            UserId = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown-user",
            LaunchPresentation = launchPresentation
        };

        // создаём сам JWT
        var jwt = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: clientId,
            claims: request.IssuedClaims,
            notBefore: now,
            expires: expires,
            signingCredentials: signingCredentials);

        var token = _tokenHandler.WriteToken(jwt);
        return token;
    }
}