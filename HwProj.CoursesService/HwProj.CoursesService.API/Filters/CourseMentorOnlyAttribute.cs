using System;
using System.Linq;
using HwProj.CoursesService.API.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.CoursesService.API.Filters
{
    public class CourseMentorOnlyAttribute : Attribute, IAuthorizationFilter
    {
        private readonly ICourseRepository _courseRepository;
        
        public CourseMentorOnlyAttribute(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }
        
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var query = context.HttpContext.Request.Query;

            if (query.TryGetValue("courseId", out var courseId))
            {
                var userId = query.Single(x => x.Key == "_id").Value;
                var course = _courseRepository.Get(long.Parse(courseId));
                if (course?.MentorId != userId)
                {
                    context.Result = new ForbidResult();
                }
            }
        }
    }
}