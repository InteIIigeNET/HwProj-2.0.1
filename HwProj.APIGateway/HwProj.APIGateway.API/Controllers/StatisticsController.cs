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
            var result = await _solutionClient.GetCourseStatistics(courseId);
            return Ok(result);
        }
    }
}