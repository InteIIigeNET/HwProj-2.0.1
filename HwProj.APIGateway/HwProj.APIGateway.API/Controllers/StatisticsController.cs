using System;
using System.Collections;
using System.Collections.Generic;
using System.Net;
using System.Linq;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Roles;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly ICoursesServiceClient _coursesClient;
        private readonly ISolutionsServiceClient _solutionClient;
        private readonly IAuthServiceClient _authClient;

        public StatisticsController(ICoursesServiceClient coursesClient, ISolutionsServiceClient solutionClient, IAuthServiceClient authClient)
        {
            _coursesClient = coursesClient;
            _solutionClient = solutionClient;
            _authClient = authClient;
        }

        [HttpGet("{courseId}")]
        //[Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(StatisticsCourseMatesModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseStatistics(long courseId)
        {
            var course = await _coursesClient.GetCourseById(courseId);
            var solutions =  (await _solutionClient.GetAllSolutions())
                .Where(s => course.Homeworks
                    .Any(hw => hw.Tasks
                        .Any(t => t.Id == s.TaskId)))
                .ToList();
            var result =  course.CourseMates.Select(async m => new StatisticsCourseMatesModel()
            {
                Id = m.StudentId,
                Name = (await _authClient.GetAccountData(m.StudentId)).Name,
                Surname = (await _authClient.GetAccountData(m.StudentId)).Surname,
                Homeworks = new List<StatisticsCourseHomeworksModel>(course.Homeworks.Select(h => new StatisticsCourseHomeworksModel()
                {
                    Id = h.Id,
                    Tasks = new List<StatisticsCourseTasksModel>(h.Tasks.Select(t =>
                    {
                        var solution = solutions.FirstOrDefault(s => s.TaskId == t.Id && s.StudentId == m.StudentId);
                        return new StatisticsCourseTasksModel()
                        {
                            Id = t.Id,
                            Solution =
                                 solution == null
                                    ? new List<StatisticsCourseSolutionsModel>()
                                    : new List<StatisticsCourseSolutionsModel>()
                                    {
                                        new StatisticsCourseSolutionsModel(solution)
                                    }
                        };
                    }))
                }))
            }).ToArray();
            await Task.WhenAll(result);
            return Ok(result.Select(t => t.Result).ToArray());
        }
    }
}