using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Repositories;
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
        private readonly IHomeworksRepository _homeworksRepository;
        private readonly ITasksRepository _tasksRepository;

        public CourseMentorOnlyAttribute(ICoursesService coursesService, IHomeworksRepository homeworksRepository,
            ITasksRepository tasksRepository)
        {
            _coursesService = coursesService;
            _homeworksRepository = homeworksRepository;
            _tasksRepository = tasksRepository;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var routeData = context.HttpContext.GetRouteData();
            var headers = context.HttpContext.Request.Headers;

            headers.TryGetValue("UserId", out var userId);
            string[]? mentorIds = null;

            if (routeData.Values.TryGetValue("courseId", out var courseId))
            {
                mentorIds = await _coursesService.GetCourseLecturers(long.Parse(courseId.ToString()));
            }

            else if (routeData.Values.TryGetValue("homeworkId", out var homeworkId))
            {
                var homeworkCourseId = await _homeworksRepository.GetCourseIdAsync(long.Parse(homeworkId.ToString()))
                                       ?? throw new InvalidOperationException("Домашнее задание не найдено");
                mentorIds = await _coursesService.GetCourseLecturers(homeworkCourseId);
            }

            else if (routeData.Values.TryGetValue("taskId", out var taskId))
            {
                var taskCourseId = await _tasksRepository.GetCourseIdAsync(long.Parse(taskId.ToString()))
                                   ?? throw new InvalidOperationException("Задача не найдена");
                mentorIds = await _coursesService.GetCourseLecturers(taskCourseId);
            }

            if (mentorIds != null && !mentorIds.Contains(userId.ToString()))
            {
                context.Result = new ContentResult
                {
                    StatusCode = StatusCodes.Status403Forbidden,
                    Content = "Недостаточно прав: Вы не являетесь ментором на курсе.",
                    ContentType = "application/json"
                };
                return;
            }

            await next.Invoke();
        }
    }
}
