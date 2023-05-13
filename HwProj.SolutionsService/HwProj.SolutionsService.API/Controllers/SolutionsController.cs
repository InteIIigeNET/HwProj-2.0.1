using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.Client;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;
using HwProj.SolutionsService.API.Domains;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Repositories;
using HwProj.SolutionsService.API.Services;
using HwProj.Utils.Auth;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HwProj.SolutionsService.API.Controllers
{
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = AuthSchemeConstants.UserIdAuthentication)]
    [ApiController]
    public class SolutionsController : Controller
    {
        private readonly ISolutionsService _solutionsService;
        private readonly ISolutionsRepository _solutionsRepository;
        private readonly IMapper _mapper;
        private readonly ICoursesServiceClient _coursesClient;

        public SolutionsController(
            ISolutionsService solutionsService,
            ISolutionsRepository solutionsRepository,
            IMapper mapper,
            ICoursesServiceClient coursesClient)
        {
            _solutionsService = solutionsService;
            _solutionsRepository = solutionsRepository;
            _coursesClient = coursesClient;
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

        [HttpPost("taskSolutions/{studentId}")]
        public async Task<Solution?[]> GetLastTaskSolutions([FromBody] long[] taskIds, string studentId)
        {
            return await _solutionsService.GetLastTaskSolutions(taskIds, studentId);
        }

        [HttpPost("{taskId}")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostSolution(long taskId, [FromBody] SolutionViewModel solutionViewModel)
        {
            var task = await _coursesClient.GetTask(taskId);
            var homework = await _coursesClient.GetHomework(task.HomeworkId);
            var course = await _coursesClient.GetCourseById(homework.CourseId);

            if (course.CourseMates.Any(courseMate =>
                    courseMate.StudentId == solutionViewModel.StudentId && courseMate.IsAccepted) &&
                task.CanSendSolution)
            {
                var solution = _mapper.Map<Solution>(solutionViewModel);
                solution.TaskId = taskId;
                var solutionId = await _solutionsService.PostOrUpdateAsync(taskId, solution);
                return Ok(solutionId);
            }

            return Forbid();
        }

        [HttpPost("rateSolution/{solutionId}")]
        public async Task<IActionResult> RateSolution(long solutionId, [FromQuery] int newRating,
            [FromQuery] string lecturerComment, [FromQuery] string lecturerId)
        {
            var solution = await _solutionsService.GetSolutionAsync(solutionId);
            var task = await _coursesClient.GetTask(solution.TaskId);
            var homework = await _coursesClient.GetHomework(task.HomeworkId);
            var course = await _coursesClient.GetCourseById(homework.CourseId);

            if (course.MentorIds.Contains(lecturerId))
            {
                await _solutionsService.RateSolutionAsync(solutionId, newRating, lecturerComment);
                return Ok();
            }

            return Forbid();
        }

        [HttpPost("rateEmptySolution/{taskId}")]
        public async Task<IActionResult> PostEmptySolutionWithRate(long taskId,
            [FromBody] SolutionViewModel solutionViewModel)
        {
            var solution = _mapper.Map<Solution>(solutionViewModel);
            await _solutionsService.PostEmptySolutionWithRateAsync(taskId, solution);
            return Ok();
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
        [ProducesResponseType(typeof(StatisticsCourseMatesDto[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseStat(long courseId)
        {
            var course = await _coursesClient.GetCourseById(courseId);
            if (course == null) return NotFound();

            var taskIds = course.Homeworks
                .SelectMany(t => t.Tasks)
                .Select(t => t.Id)
                .ToArray();

            var userId = Request.GetUserIdFromHeader();
            var solutions = await _solutionsRepository.FindAll(t => taskIds.Contains(t.TaskId)).ToListAsync();
            var courseMates = course.MentorIds.Contains(userId)
                ? course.CourseMates.Where(t => t.IsAccepted)
                : course.CourseMates.Where(t => t.StudentId == userId);

            var solutionsStatsContext = new StatisticsAggregateModel
            {
                CourseMates = courseMates,
                Homeworks = course.Homeworks.Where(t => t.Tasks.Any()).ToList(),
                Solutions = solutions
            };

            var result = SolutionsStatsDomain.GetCourseStatistics(solutionsStatsContext);
            return Ok(result);
        }

        [HttpGet("getTaskStats/{taskId}")]
        [ProducesResponseType(typeof(StudentSolutions[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetTaskStats(long taskId)
        {
            var solutions = await _solutionsRepository.FindAll(t => t.TaskId == taskId).ToListAsync();
            var result = SolutionsStatsDomain.GetCourseTaskStatistics(solutions);
            return Ok(result);
        }

        [HttpPost("allUnrated")]
        public async Task<SolutionPreviewDto[]> GetAllUnratedSolutionsForTasks([FromBody] long[] taskIds)
        {
            var solutions = await _solutionsRepository
                .FindAll(t => taskIds.Contains(t.TaskId))
                .GroupBy(t => new { t.TaskId, t.StudentId })
                .Select(t => t.OrderByDescending(x => x.PublicationDate))
                .Select(t => new
                {
                    LastSolution = t.FirstOrDefault(),
                    IsFirstTry = t.Skip(1).All(s => s.State == SolutionState.Posted)
                })
                .Where(t => t.LastSolution != null && t.LastSolution.State == SolutionState.Posted)
                .OrderBy(t => t.LastSolution!.PublicationDate)
                .Select(t => new SolutionPreviewDto
                {
                    StudentId = t.LastSolution!.StudentId,
                    TaskId = t.LastSolution.TaskId,
                    PublicationDate = t.LastSolution.PublicationDate,
                    IsFirstTry = t.IsFirstTry
                })
                .ToArrayAsync();

            return solutions;
        }
    }
}
