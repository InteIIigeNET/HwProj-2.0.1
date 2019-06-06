using System.Linq;
using Microsoft.AspNetCore.Http;

namespace HwProj.CoursesService.API.Extensions
{
    public static class RequestExtension
    {
        public static string GetUserId(this HttpRequest request)
            => request.Query.First(x => x.Key == "_id").Value.ToString();
    }
}