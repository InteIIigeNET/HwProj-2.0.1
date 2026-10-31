using System.Linq;
using System.Threading.Tasks;
using HwProj.Common.Net8;
using HwProj.CoursesService.API.Domains;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace HwProj.CoursesService.API.Authorization
{
    /// <summary>
    /// Курс определяется по courseId (из маршрута или query), иначе по homeworkId или taskId.
    /// Если курс определить не удалось, доступ запрещается
    /// </summary>
    public class CourseMentorAuthorizationHandler : AuthorizationHandler<CourseMentorRequirement, HttpContext>
    {
        public const string FailureMessage = "Недостаточно прав: Вы не являетесь ментором на курсе.";

        private readonly ICoursesService _coursesService;
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly ITasksRepository _tasksRepository;

        public CourseMentorAuthorizationHandler(ICoursesService coursesService,
            IHomeworksRepository homeworksRepository, ITasksRepository tasksRepository)
        {
            _coursesService = coursesService;
            _homeworksRepository = homeworksRepository;
            _tasksRepository = tasksRepository;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context,
            CourseMentorRequirement requirement, HttpContext httpContext)
        {
            var userId = context.User.GetUserId();
            var courseId = await GetCourseIdAsync(httpContext);

            if (userId != null && courseId != null &&
                await _coursesService.GetCourseAccessAsync(courseId.Value, userId) == CourseAccess.Mentor)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, FailureMessage));
        }

        private async Task<long?> GetCourseIdAsync(HttpContext httpContext)
        {
            if (TryGetId(httpContext, "courseId", out var courseId)) return courseId;
            if (TryGetId(httpContext, "homeworkId", out var homeworkId))
                return await _homeworksRepository.GetCourseIdAsync(homeworkId);
            if (TryGetId(httpContext, "taskId", out var taskId))
                return await _tasksRepository.GetCourseIdAsync(taskId);
            return null;
        }

        private static bool TryGetId(HttpContext httpContext, string key, out long id)
        {
            var value = httpContext.GetRouteValue(key)?.ToString() ?? httpContext.Request.Query[key].FirstOrDefault();
            return long.TryParse(value, out id);
        }
    }
}
