using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.APIGateway.API.Filters
{
    public class CourseMentorOnlyAttribute : ActionFilterAttribute
    {
        private readonly ICoursesServiceClient _coursesServiceClient;

        public CourseMentorOnlyAttribute(ICoursesServiceClient coursesServiceClient)
        {
            _coursesServiceClient = coursesServiceClient;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var userId = context.HttpContext.User.Claims
                .FirstOrDefault(claim => claim.Type.ToString() == "_id")?.Value;
            if (userId == null)
            {
                context.Result = new ContentResult
                {
                    StatusCode = StatusCodes.Status403Forbidden,
                    Content = "В запросе не передан идентификатор пользователя",
                    ContentType = "application/json"
                };
                return;
            }
            
            string[]? mentorIds = null;
            
            var courseId = GetValueFromRequest(context.HttpContext.Request, "courseId");
            if (courseId != null && long.TryParse(courseId, out var id))
            {
                mentorIds = await _coursesServiceClient.GetCourseLecturersIds(id);
            }

            if (mentorIds == null || !mentorIds.Contains(userId))
            {
                context.Result = new ContentResult
                {
                    StatusCode = StatusCodes.Status403Forbidden,
                    Content = "Недостаточно прав для работы с файлами: Вы не являетесь ментором на курсе",
                    ContentType = "application/json"
                };
                return;
            }

            await next.Invoke();
        }
        
        private static string? GetValueFromRequest(HttpRequest request, string key)
        {
            if (request.Query.TryGetValue(key, out var queryValue)) 
                return queryValue.ToString();
    
            if (request.HasFormContentType && request.Form.TryGetValue(key, out var formValue)) 
                return formValue.ToString();
    
            return null;
        }
    }
}