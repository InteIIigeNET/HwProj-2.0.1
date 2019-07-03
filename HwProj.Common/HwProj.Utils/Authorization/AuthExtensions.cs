using System.Linq;
using Microsoft.AspNetCore.Http;

namespace HwProj.Utils.Authorization
{
    public static class AuthExtensions
    {
        public static string GetUserId(this HttpRequest request)
        {
            return request.Query.First(x => x.Key == "_id").Value.ToString();
        }
    }
}