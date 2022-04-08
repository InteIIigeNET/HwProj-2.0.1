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

        public CourseMentorOnlyAttribute(ICoursesService coursesService)
        {
            _coursesService = coursesService;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var routeData = context.HttpContext.GetRouteData();
            var headers = context.HttpContext.Request.Headers;

            if (routeData.Values.TryGetValue("courseId", out var courseId))
            {
                headers.TryGetValue("UserId", out var userId);
                var mentorIds = _coursesService.GetCourseLecturers(long.Parse(courseId.ToString())).Result;

                if (!mentorIds.Contains(userId.ToString()))
                {
                    context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
                }
            }
        }
    }
}
