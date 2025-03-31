using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.CoursesService.API.Filters
{
    public class CourseDataFilterAttribute : ResultFilterAttribute
    {
        public override async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
        {
            var userId = context.HttpContext.Request.GetUserIdFromHeader();

            if (userId == null)
            {
                context.Result = new ForbidResult();
            }
            else
            {
                var result = context.Result as ObjectResult;
                if (result?.Value is CourseDTO courseDto && !courseDto.MentorIds.Contains(userId))
                {
                    var currentDate = DateTime.UtcNow;

                    var isCourseStudent = courseDto.CourseMates.Any(t => t.IsAccepted && t.StudentId == userId);

                    courseDto.CourseMates = isCourseStudent
                        ? courseDto.CourseMates
                        : new[] { courseDto.CourseMates.First(x => x.StudentId == userId) };

                    courseDto.Homeworks = courseDto.Homeworks
                        .Where(h =>
                            currentDate >= h.PublicationDate &&
                            (isCourseStudent || !h.Tags.Contains(HomeworkTags.Test)))
                        .ToArray();

                    foreach (var homework in courseDto.Homeworks)
                    {
                        homework.Tasks =
                            new List<HomeworkTaskViewModel>(homework.Tasks.Where(t =>
                                currentDate >= t.PublicationDate));
                    }

                    courseDto.Groups = courseDto.Groups.Where(g => g.StudentsIds.Contains(userId)).ToArray();
                }
            }

            await next();
        }
    }
}
