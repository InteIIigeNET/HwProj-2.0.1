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
    public class GuestModeAuthenticationOptions : AuthenticationSchemeOptions
    {
    }
    
    public class GuestModeAuthenticationHandler : AuthenticationHandler<GuestModeAuthenticationOptions>
    {
        public GuestModeAuthenticationHandler(
            IOptionsMonitor<GuestModeAuthenticationOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock)
            : base(options, logger, encoder, clock)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var isGuest = Request.GetGuestModeFromHeader();
            if (isGuest != "true")
                return Task.FromResult(AuthenticateResult.Fail("Unauthorized"));
            
            var claims = new List<Claim>
            {
                new Claim("_isGuest", isGuest)
            };

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new System.Security.Principal.GenericPrincipal(identity, null);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);
            
            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}