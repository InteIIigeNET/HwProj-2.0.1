using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Http;

namespace HwProj.CoursesService.API.Authorization
{
    /// <summary>
    /// Возвращает в теле ответа 403 причину отказа в правах ментора: её показывает пользователю API Gateway
    /// </summary>
    public class CourseMentorAuthorizationResultHandler : IAuthorizationMiddlewareResultHandler
    {
        private readonly AuthorizationMiddlewareResultHandler _defaultHandler =
            new AuthorizationMiddlewareResultHandler();

        public async Task HandleAsync(RequestDelegate next, HttpContext context, AuthorizationPolicy policy,
            PolicyAuthorizationResult authorizeResult)
        {
            var failureReason = authorizeResult.Forbidden
                ? authorizeResult.AuthorizationFailure?.FailureReasons
                    .FirstOrDefault(r => r.Handler is CourseMentorAuthorizationHandler)
                : null;

            if (failureReason == null)
            {
                await _defaultHandler.HandleAsync(next, context, policy, authorizeResult);
                return;
            }

            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "text/plain; charset=utf-8";
            await context.Response.WriteAsync(failureReason.Message);
        }
    }
}
