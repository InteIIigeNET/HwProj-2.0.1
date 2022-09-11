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
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HwProj.SolutionsService.API.Controllers
{
    [Route("api/[controller]")]
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

        [HttpPost("{taskId}")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostSolution(long taskId, [FromBody] SolutionViewModel solutionViewModel)
        {
            var task = await _coursesClient.GetTask(taskId);
            var homework = await _coursesClient.GetHomework(task.HomeworkId);
            var course = await _coursesClient.GetCourseById(homework.CourseId, solutionViewModel.StudentId);

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
        [ProducesResponseType(typeof(StatisticsCourseMatesDto[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseStat(long courseId, [FromQuery] string userId)
        {
            var course = await _coursesClient.GetCourseById(courseId, userId);
            if (course == null) return NotFound();

            var taskIds = course.Homeworks
                .SelectMany(t => t.Tasks)
                .Select(t => t.Id)
                .ToArray();

            var solutions = await _solutionsRepository.FindAll(t => taskIds.Contains(t.TaskId)).ToListAsync();
            var courseMates = course.MentorIds.Contains(userId)
                ? course.CourseMates.Where(t => t.IsAccepted)
                : course.CourseMates.Where(t => t.StudentId == userId);

            var solutionsStatsContext = new StatisticsAggregateModel
            {
                CourseMates = courseMates,
                Homeworks = course.Homeworks,
                Solutions = solutions
            };

            var result = SolutionsStatsDomain.GetCourseStatistics(solutionsStatsContext).ToArray();

            return Ok(result);
        }

        [HttpPost("allUnrated")]
        public async Task<SolutionPreviewDto[]> GetAllUnratedSolutionsForTasks([FromBody] long[] taskIds)
        {
            var solutions = await _solutionsRepository
                .FindAll(t => taskIds.Contains(t.TaskId) && t.State == SolutionState.Posted)
                .Select(t => new SolutionPreviewDto
                {
                    StudentId = t.StudentId,
                    TaskId = t.TaskId,
                    PublicationDate = t.PublicationDate
                })
                .ToArrayAsync();

            solutions = solutions.GroupBy(t => t.TaskId)
                .Select(taskGroups => taskGroups
                    .GroupBy(studentGroups => studentGroups.StudentId)
                    .Select(s =>
                    {
                        var solutions = s.OrderByDescending(x => x.PublicationDate);
                        var lastSolution = solutions.First();
                        lastSolution.IsFirstTry = !solutions.Skip(1).Any();
                        return lastSolution;
                    }))
                .SelectMany(t => t)
                .OrderBy(t => t.PublicationDate)
                .ToArray();

            return solutions;
        }
    }
}
