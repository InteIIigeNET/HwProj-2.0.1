using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Authorization.Requirements;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.APIGateway.API.Authorization.Handlers
{
    public class JwtRequirementHandler : AuthorizationHandler<JwtRequirement>
    {
        private long _courseId;
        private string _creatorId;
        
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, JwtRequirement requirement)
        {
            if (context.User.Identity.IsAuthenticated)
            {
                context.Succeed(requirement);
                
                return Task.CompletedTask;
            }

            var httpContext = (AuthorizationFilterContext)context.Resource;
            if (httpContext == null) 
                return Task.CompletedTask;

            var token = httpContext.HttpContext.Request.Query["token"].ToString();
            var courseIdRoute = long.Parse(httpContext.HttpContext.GetRouteValue("courseId").ToString());

            if (!string.IsNullOrEmpty(token) && ValidateToken(token) && courseIdRoute == _courseId)
            {
                var claims = new List<Claim>
                {
                    new Claim("_id", _creatorId)
                };
                var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "JWT"));
                httpContext.HttpContext.User = principal;
                
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }

        private bool ValidateToken(string authorizationToken)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = "AuthService",
                ValidateLifetime = false,
                ValidateAudience = false,
                IssuerSigningKey = Utils.Auth.AuthorizationKey.SecurityKey,
            };
            var principal =
                tokenHandler.ValidateToken(authorizationToken, validationParameters, out var validatedToken);

            var courseIdClaim = principal.Claims.FirstOrDefault(c => c.Type == "_courseId");
            var creatorIdClaim = principal.Claims.FirstOrDefault(c => c.Type == "_creatorId");

            if (creatorIdClaim == null || courseIdClaim == null || !long.TryParse(courseIdClaim.Value, out var courseId))
                return false;
            _courseId = courseId;
            _creatorId = creatorIdClaim.Value;
                
            return true;
        }
    }
}