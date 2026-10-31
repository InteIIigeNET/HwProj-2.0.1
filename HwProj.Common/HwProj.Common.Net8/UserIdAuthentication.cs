using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HwProj.Common.Net8;

public static class UserIdAuthenticationDefaults
{
    public const string AuthenticationScheme = "UserIdAuth";
    public const string UserIdClaimType = "_id";
}

/// <summary>
/// Аутентифицирует запрос по заголовку UserId, который проставляет вызывающий сервис (API Gateway)
/// </summary>
public class UserIdAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var userId = Request.GetUserIdFromHeader();
        if (string.IsNullOrEmpty(userId)) return Task.FromResult(AuthenticateResult.NoResult());

        var identity = new ClaimsIdentity(
            new[] { new Claim(UserIdAuthenticationDefaults.UserIdClaimType, userId) },
            Scheme.Name);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

public static class UserIdAuthenticationExtensions
{
    public static AuthenticationBuilder AddUserIdAuthentication(this IServiceCollection services) =>
        services
            .AddAuthentication(UserIdAuthenticationDefaults.AuthenticationScheme)
            .AddScheme<AuthenticationSchemeOptions, UserIdAuthenticationHandler>(
                UserIdAuthenticationDefaults.AuthenticationScheme, null);
}
