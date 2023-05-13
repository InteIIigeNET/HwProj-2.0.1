using System.Net.Http;
using Microsoft.AspNetCore.Http;

namespace HwProj.HttpUtils
{
    public static class RequestHeaderBuilder
    {
        public static void TryAddUserId(this HttpRequestMessage request, IHttpContextAccessor httpContextAccessor)
        {
            var userId = httpContextAccessor.HttpContext.User.FindFirst("_id");
            if (userId != null) request.Headers.Add("UserId", userId.Value);
        }
    }
}
