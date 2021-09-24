using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;
using HwProj.SolutionsService.API.Domains;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.SolutionsService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SolutionsController : Controller
    {
        private readonly IAuthServiceClient _authClient;
        private readonly ISolutionsService _solutionsService;
        private readonly IMapper _mapper;
        private readonly ICoursesServiceClient _coursesClient;
        
        public SolutionsController(ISolutionsService solutionsService, IMapper mapper, ICoursesServiceClient coursesClient, IAuthServiceClient authClient)
        {
            _solutionsService = solutionsService;
            _coursesClient = coursesClient;
            _authClient = authClient;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<Solution[]> GetAllSolutions()
        {
            return await _solutionsService.GetAllSolutionsAsync();
        }

        [HttpGet("{solutionId}")]
        public async Task<IActionResult> GetSolution(long solutionId)
        {
            var solution = await _solutionsService.GetSolutionAsync(solutionId);
            return solution == null
                ? NotFound()
                : Ok(solution) as IActionResult;
        }

        [HttpGet("taskSolutions/{taskId}/{studentId}")]
        public async Task<Solution[]> GetTaskSolutionsFromStudent(long taskId, string studentId)
        {
            return await _solutionsService.GetTaskSolutionsFromStudentAsync(taskId, studentId);
        }

        [HttpPost("{taskId}")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostSolution(long taskId, [FromBody] SolutionViewModel solutionViewModel)
        {
            var task = await _coursesClient.GetTask(taskId);
            var homework = await _coursesClient.GetHomework(task.HomeworkId);
            var course = await _coursesClient.GetCourseById(homework.CourseId, solutionViewModel.StudentId);

            if (course.CourseMates.Exists(courseMate => courseMate.StudentId == solutionViewModel.StudentId && courseMate.IsAccepted) && task.CanSendSolution)
            {
                var solution = _mapper.Map<Solution>(solutionViewModel);
                solution.TaskId = taskId;
                var solutionId = await _solutionsService.PostOrUpdateAsync(taskId, solution);
                return Ok(solutionId);
            }
            return Forbid();
        }

        [HttpPost("rateSolution/{solutionId}")]
        public async Task<IActionResult> RateSolution(long solutionId, [FromQuery] int newRating, [FromQuery] string lecturerComment, [FromQuery] string lecturerId)
        {
            var solution = await _solutionsService.GetSolutionAsync(solutionId);
            var task = await _coursesClient.GetTask(solution.TaskId);
            var homework = await _coursesClient.GetHomework(task.HomeworkId);
            var course = await _coursesClient.GetCourseById(homework.CourseId, "");

            if (course.MentorIds.Contains(lecturerId))
            {
                await _solutionsService.RateSolutionAsync(solutionId, newRating, lecturerComment);
                return Ok();
            }
            return Forbid();
        }
        
        [HttpPost("markSolutionFinal/{solutionId}")]
        public async Task MarkSolutionFinal(long solutionId)
        {
            await _solutionsService.MarkSolutionFinal(solutionId);
        }

        [HttpDelete("delete/{solutionId}")]
        public async Task DeleteSolution(long solutionId)
        {
            await _solutionsService.DeleteSolutionAsync(solutionId);
        }
        
        [HttpPost("{groupId}/{taskId}")]
        public async Task<long> PostSolution(long groupId, long taskId, [FromBody] SolutionViewModel solutionViewModel)
        {
            var solution = _mapper.Map<Solution>(solutionViewModel);
            solution.GroupId = groupId;
            var solutionId = await _solutionsService.PostOrUpdateAsync(taskId, solution);
            return solutionId;
        }

        [HttpGet("{groupId}/taskSolutions/{taskId}")]
        public async Task<Solution[]> GetTaskSolutionsFromGroup(long groupId, long taskId)
        {
            return await _solutionsService.GetTaskSolutionsFromGroupAsync(taskId, groupId);
        }

        [HttpGet("getCourseStat/{courseId}")]
        [ProducesResponseType(typeof(StatisticsCourseMatesModel[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseStat(long courseId, [FromQuery] string userId)
        {
            var course = await _coursesClient.GetCourseById(courseId, userId);
            course.CourseMates.RemoveAll(cm => !cm.IsAccepted);

            if (!course.MentorIds.Contains(userId))
            {
                return Forbid();
            }
            
            var solutions =  (await _solutionsService.GetAllSolutionsAsync())
                .Where(s => course.Homeworks
                    .Any(hw => hw.Tasks
                        .Any(t => t.Id == s.TaskId)))
                .ToList();
            
            var courseMatesData = new Dictionary<string, AccountDataDto>();

            //course.CourseMates.ForEach(async cm => courseMatesData.Add(cm.StudentId, await _authClient.GetAccountData(cm.StudentId)));
            
            foreach (var cm in course.CourseMates)
            {
                courseMatesData.Add(cm.StudentId, await _authClient.GetAccountData(cm.StudentId));
            }

            var solutionsStatsContext = new StatisticsAggregateModel()
            {
                Course = course,
                Solutions = solutions,
                CourseMatesData = courseMatesData
            };

            var result = SolutionsStatsDomain.GetCourseStatistics(solutionsStatsContext);
            return Ok(result);
        }
    }
}
