using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HwProj.Common.Net8;

public static class AuthSchemeConstants
{
    public const string UserIdAuthentication = "UserIdAuth";
}

public class UserIdAuthenticationOptions : AuthenticationSchemeOptions
{
}

/// <summary>
/// Аутентифицирует запрос по заголовку UserId, который проставляет API Gateway
/// </summary>
public class UserIdAuthenticationHandler(
    IOptionsMonitor<UserIdAuthenticationOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<UserIdAuthenticationOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var userId = Request.GetUserIdFromHeader();
        if (userId == null) return Task.FromResult(AuthenticateResult.Fail("Unauthorized"));

        var identity = new ClaimsIdentity([new Claim("_id", userId)], Scheme.Name);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

public static class UserIdAuthenticationExtensions
{
    public static IServiceCollection AddUserIdAuthentication(this IServiceCollection services)
    {
        services
            .AddAuthentication(AuthSchemeConstants.UserIdAuthentication)
            .AddScheme<UserIdAuthenticationOptions, UserIdAuthenticationHandler>(
                AuthSchemeConstants.UserIdAuthentication, null);

        return services;
    }
}
