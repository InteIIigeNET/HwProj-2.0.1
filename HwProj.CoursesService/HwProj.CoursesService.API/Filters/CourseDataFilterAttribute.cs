using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models;
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

                    var isCourseStudent = false;
                    courseDto.CourseMates = courseDto.CourseMates
                        .Where(t =>
                        {
                            if (!t.IsAccepted) return t.StudentId == userId;
                            if (t.StudentId == userId) isCourseStudent = true;
                            return true;
                        })
                        .ToArray();

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
