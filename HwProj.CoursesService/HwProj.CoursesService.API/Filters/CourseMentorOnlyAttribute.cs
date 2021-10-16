using System;
using System.Linq;
using HwProj.CoursesService.API.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;

namespace HwProj.CoursesService.API.Filters
{
    public class CourseMentorOnlyAttribute : Attribute, IAuthorizationFilter
    {
        private readonly ICoursesRepository _coursesRepository;
        
        public CourseMentorOnlyAttribute(ICoursesRepository coursesRepository)
        {
            _coursesRepository = coursesRepository;
        }
        
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var routeData = context.HttpContext.GetRouteData();
            var headers = context.HttpContext.Request.Headers;

            if (routeData.Values.TryGetValue("courseId", out var courseId))
            {
                var userId = headers.SingleOrDefault(x => x.Key == "UserId").Value.ToString();
                var course = _coursesRepository.GetAsync(long.Parse(courseId.ToString())).Result;
                if (course?.MentorIds != null && !(bool)course?.MentorIds.Split('/').Contains(userId))
                {
                    context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
                }
            }
        }
    }
}