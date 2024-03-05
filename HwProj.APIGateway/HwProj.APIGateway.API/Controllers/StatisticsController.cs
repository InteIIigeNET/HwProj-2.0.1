﻿using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Models.Statistics;
using HwProj.AuthService.Client;
using HwProj.Models.Roles;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : AggregationController
    {
        private readonly ISolutionsServiceClient _solutionClient;

        public StatisticsController(ISolutionsServiceClient solutionClient, IAuthServiceClient authServiceClient) :
            base(authServiceClient)
        {
            _solutionClient = solutionClient;
        }

        [HttpGet("{courseId}/lecturers")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(StatisticsLecturersModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetLecturersStatistics(long courseId)
        {
            var statistics = await _solutionClient.GetLecturersStatistics(courseId);
            if (statistics == null)
                return NotFound();

            var lecturers = await AuthServiceClient.GetAccountsData(statistics.Select(s => s.LecturerId).ToArray());

            var result = statistics.Zip(lecturers, (stat, lecturer) => new StatisticsLecturersModel
            {
                Lecturer = lecturer,
                NumberOfCheckedSolutions = stat.NumberOfCheckedSolutions
            }).ToArray();

            return Ok(result);
        }

        [HttpGet("{courseId}")]
        [ProducesResponseType(typeof(StatisticsCourseMatesModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseStatistics(long courseId)
        {
            var statistics = await _solutionClient.GetCourseStatistics(courseId, UserId);
            if (statistics == null) return Forbid();

            var studentIds = statistics.Select(t => t.StudentId).ToArray();
            var students = await AuthServiceClient.GetAccountsData(studentIds);

            var result = statistics.Zip(students, (stats, student) => new StatisticsCourseMatesModel
            {
                Id = student.UserId,
                Name = student.Name,
                Surname = student.Surname,
                Homeworks = stats.Homeworks
            }).OrderBy(t => t.Surname).ThenBy(t => t.Name);

            return Ok(result);
        }
    }
}
