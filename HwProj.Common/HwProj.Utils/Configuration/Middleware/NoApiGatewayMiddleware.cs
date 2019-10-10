using System.Threading.Tasks;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Http;

namespace HwProj.Utils.Configuration.Middleware
{
    public class NoApiGatewayMiddleware : IMiddleware
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var request = context.Request;

            if (!request.Query.ContainsKey("_id"))
            {
                request.QueryString = request.QueryString.Add("_id", "hwprojDevUser");
            }

            if (!request.Query.ContainsKey("_role"))
            {
                request.QueryString = request.QueryString.Add("_role", Roles.LecturerRole);
            }

            await next.Invoke(context);
        }
    }
}