using System;
using System.Linq;
using HwProj.CoursesService.API.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.CoursesService.API.Filters
{
    public class IsCourseMentor : Attribute, IAuthorizationFilter
    {
        private readonly ICourseRepository _courseRepository;
        
        public IsCourseMentor(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }
        
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (context.HttpContext.Request.Query.TryGetValue("courseId", out var courseId))
            {
                var userId = context.HttpContext.Request.Query.FirstOrDefault(x => x.Key == "_id").Value.ToString();
                var course = _courseRepository.Get(long.Parse(courseId.ToString()));
                if (course?.MentorId != userId)
                {
                    context.Result = new ForbidResult();
                }
            }
        }
    }
}