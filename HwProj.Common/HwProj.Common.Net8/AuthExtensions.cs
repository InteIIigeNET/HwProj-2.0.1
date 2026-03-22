using Microsoft.AspNetCore.Http;

namespace HwProj.Common.Net8;

public static class AuthExtensions
{
    public static string? GetUserIdFromHeader(this HttpRequest request) =>
        request.Headers.TryGetValue("UserId", out var id) ? id.FirstOrDefault() : null;
}
