using HwProj.ContentService.API.Services;
using HwProj.CoursesService.Client;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.ContentService.API.Filters
{
    public class CourseMentorOnlyAttribute : ActionFilterAttribute
    {
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly IFileKeyService _fileKeyService;

        public CourseMentorOnlyAttribute(ICoursesServiceClient coursesServiceClient, IFileKeyService fileKeyService)
        {
            _coursesServiceClient = coursesServiceClient;
            _fileKeyService = fileKeyService;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var headers = context.HttpContext.Request.Headers;
            headers.TryGetValue("UserId", out var userId);
            string[]? mentorIds = null;

            if (context.HttpContext.Request.HasFormContentType &&
                context.HttpContext.Request.Form.TryGetValue("courseId", out var formCourseId))
            {
                mentorIds = await _coursesServiceClient.GetCourseLecturersIds(long.Parse(formCourseId.ToString()));
            }
            // Если передаем в параметрах запроса только ключ к файлу, достаем из ключа id курса
            else if (context.HttpContext.Request.Query.TryGetValue("key", out var key))
            {
                if (_fileKeyService.GetCourseIdFromKey(key.ToString(), out var implicitCourseId))
                    mentorIds = await _coursesServiceClient.GetCourseLecturersIds(implicitCourseId);
            }

            if (mentorIds == null || !mentorIds.Contains(userId.ToString()))
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
    }
}