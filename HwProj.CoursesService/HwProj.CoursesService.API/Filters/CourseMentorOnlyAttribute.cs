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
        
        public async void OnAuthorization(AuthorizationFilterContext context)
        {
            var routeData = context.HttpContext.GetRouteData();
            var query = context.HttpContext.Request.Query;

            if (routeData.Values.TryGetValue("courseId", out var courseId))
            {
                var userId = query.SingleOrDefault(x => x.Key == "_id").Value;
                var course = await _coursesRepository.GetAsync(long.Parse(courseId.ToString()));
                if (course?.MentorId != userId)
                {
                    context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
                }
            }
        }
    }
}