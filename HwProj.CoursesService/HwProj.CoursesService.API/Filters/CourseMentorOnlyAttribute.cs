using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;

namespace HwProj.CoursesService.API.Filters
{
    public class CourseMentorOnlyAttribute : ActionFilterAttribute
    {
        private readonly ICoursesService _coursesService;
        private readonly IHomeworksService _homeworksService;
        private readonly ITasksService _taskService;
        private readonly ICourseFilterService _courseFilterService;

        public CourseMentorOnlyAttribute(ICoursesService coursesService, IHomeworksService homeworksService,
            ITasksService taskService, ICourseFilterService courseFilterService)
        {
            _coursesService = coursesService;
            _homeworksService = homeworksService;
            _taskService = taskService;
            _courseFilterService = courseFilterService;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var routeData = context.HttpContext.GetRouteData();
            var headers = context.HttpContext.Request.Headers;

            headers.TryGetValue("UserId", out var userId);
            string[]? mentorIds = null;
            Filter? filter = null;

            if (routeData.Values.TryGetValue("courseId", out var courseId))
            {
                filter = await _courseFilterService
                    .GetUserCourseFilterAsync(userId, long.Parse(courseId.ToString()));
                mentorIds = await _coursesService.GetCourseLecturers(long.Parse(courseId.ToString()));
            }

            else if (routeData.Values.TryGetValue("homeworkId", out var homeworkId))
            {
                var homework = await _homeworksService.GetHomeworkAsync(long.Parse(homeworkId.ToString()));
                mentorIds = await _coursesService.GetCourseLecturers(homework.CourseId);
            }

            else if (routeData.Values.TryGetValue("taskId", out var taskId))
            {
                var task = await _taskService.GetTaskAsync(long.Parse(taskId.ToString()));
                mentorIds = await _coursesService.GetCourseLecturers(task.Homework.CourseId);
            }

            if (mentorIds != null && !mentorIds.Contains(userId.ToString()) 
                || filter != null && !filter.CourseMateIds.Contains(userId.ToString()))
            {
                context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
            }

            await next.Invoke();
        }
    }
}
