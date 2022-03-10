using System;
using System.Linq;
using System.Security.Claims;
using HwProj.CoursesService.API.Repositories;
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
            var userId = context.HttpContext.Current.User.Identity.GetUserId().ToString();
            var z = 10;
            if (routeData.Values.TryGetValue("courseId", out var courseId))
            {
                //var userId = "abc";//headers.SingleOrDefault(x => x.Key == "UserId").Value.ToString();
                var mentorIds = _coursesService.GetCourseLecturers(long.Parse(courseId.ToString())).Result;

                var y = 10;
                if (mentorIds != null && !mentorIds.Contains(userId))
                {
                    context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
                }
            }
        }
    }
}
