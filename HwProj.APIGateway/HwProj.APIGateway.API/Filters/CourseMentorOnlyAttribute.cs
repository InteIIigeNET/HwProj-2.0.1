using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.Models.ContentService.DTO;
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
            long courseId = -1;

            // Для метода Process (параметр: processFilesDto)
            if (context.ActionArguments.TryGetValue("processFilesDto", out var processFilesDto) &&
                processFilesDto is ProcessFilesDTO dto)
                courseId = dto.FilesScope.CourseId;
            
            // Для метода GetStatuses (параметр: filesScope)
            else if (context.ActionArguments.TryGetValue("filesScope", out var filesScope) &&
                     filesScope is ScopeDTO scope)
                courseId = scope.CourseId;

            if (courseId != -1)
                mentorIds = await _coursesServiceClient.GetCourseLecturersIds(courseId);

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