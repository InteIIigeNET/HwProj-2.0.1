using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.Models;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HwProj.APIGateway.API.Filters
{
    public class CourseDataFilterAttribute : ResultFilterAttribute
    {
        public override async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
        {
            var userId = context.HttpContext.User.Claims
                .FirstOrDefault(claim => claim.Type.ToString() == "_id")
                ?.Value;;

            if (userId == null)
            {
                context.Result = new ForbidResult();
            }
            else
            {
                var result = context.Result as ObjectResult;
                if (result?.Value is CourseViewModel courseViewModel &&
                    courseViewModel.Mentors.All(mentor => mentor.UserId != userId))
                {
                    var currentDate = DateTimeUtils.GetMoscowNow();
                    foreach (var homework in courseViewModel.Homeworks)
                    {
                        homework.Tasks =
                            new List<HomeworkTaskViewModel>(homework.Tasks.Where(t =>
                                currentDate >= t.PublicationDate));
                    }

                    courseViewModel.NewStudents = Array.Empty<AccountDataDto>();
                }
            }

            await next();
        }
    }
}