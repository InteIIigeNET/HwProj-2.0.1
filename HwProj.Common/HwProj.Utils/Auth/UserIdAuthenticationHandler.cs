using System.Collections.Generic;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HwProj.Utils.Auth
{
    public static class AuthSchemeConstants
    {
        public const string UserIdAuthentication = "UserIdAuth";
    }

    public class UserIdAuthenticationOptions : AuthenticationSchemeOptions
    {
    }

    public class UserIdAuthenticationHandler : AuthenticationHandler<UserIdAuthenticationOptions>
    {
        public UserIdAuthenticationHandler(
            IOptionsMonitor<UserIdAuthenticationOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock)
            : base(options, logger, encoder, clock)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var userId = Request.GetUserIdFromHeader();
            if (userId == null) return Task.FromResult(AuthenticateResult.Fail("Unauthorized"));

            var claims = new List<Claim>
            {
                new Claim("_id", userId)
            };

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new System.Security.Principal.GenericPrincipal(identity, null);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);
            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
