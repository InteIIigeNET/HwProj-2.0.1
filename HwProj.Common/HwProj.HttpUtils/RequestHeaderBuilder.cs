using System.Net.Http;
using Microsoft.AspNetCore.Http;

namespace HwProj.HttpUtils
{
    public static class RequestHeaderBuilder
    {
        public static void AddUserId(this HttpRequestMessage request, IHttpContextAccessor httpContextAccessor)
        {
            request.Headers.Add("UserId", httpContextAccessor.HttpContext.User.FindFirst("_id").Value);
        }
    }
}
