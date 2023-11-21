using System;
using System.Linq;
using HwProj.CoursesService.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;

namespace HwProj.CoursesService.API.Filters
{
    public class CourseMentorOnlyAttribute : Attribute, IAuthorizationFilter
    {
        private readonly ICoursesService _coursesService;
        private readonly IHomeworksService _homeworksService;
        private readonly ITasksService _taskService;

        public CourseMentorOnlyAttribute(ICoursesService coursesService, IHomeworksService homeworksService, ITasksService taskService)
        {
            _coursesService = coursesService;
            _homeworksService = homeworksService;
            _taskService = taskService;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var routeData = context.HttpContext.GetRouteData();
            var headers = context.HttpContext.Request.Headers;

            headers.TryGetValue("UserId", out var userId);
            string[]? mentorIds = null;

            if (routeData.Values.TryGetValue("courseId", out var courseId))
            {
                mentorIds = _coursesService.GetCourseLecturers(long.Parse(courseId.ToString())).Result;
            }
            else if (routeData.Values.TryGetValue("homeworkId", out var homeworkId))
            {

                var id = _homeworksService.GetHomeworkAsync(long.Parse(homeworkId.ToString())).Result.CourseId;

                mentorIds = _coursesService.GetCourseLecturers(id).Result;
            }
            else if (routeData.Values.TryGetValue("taskId", out var taskId))
            {

                var id = _taskService.GetTaskAsync(long.Parse(taskId.ToString())).Result.Homework.CourseId;

                mentorIds = _coursesService.GetCourseLecturers(id).Result;
            }

            if (mentorIds != null && !mentorIds.Contains(userId.ToString()))
            {
                context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
            }
        }
    }
}
