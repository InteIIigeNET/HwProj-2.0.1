using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService.ViewModels;
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
        public async Task<IActionResult> PostSolution(long taskId, [FromBody] PostSolutionModel solutionModel)
        {
            var task = await _coursesClient.GetTask(taskId);
            if (!task.CanSendSolution) return BadRequest();

            var solution = _mapper.Map<Solution>(solutionModel);
            solution.TaskId = taskId;
            var solutionId = await _solutionsService.PostOrUpdateAsync(taskId, solution);
            return Ok(solutionId);
        }

        [HttpPost("rateSolution/{solutionId}")]
        public async Task<IActionResult> RateSolution(long solutionId,
            [FromBody] RateSolutionModel rateSolutionModel)
        {
            var solution = await _solutionsService.GetSolutionAsync(solutionId);
            var task = await _coursesClient.GetTask(solution.TaskId);
            var homework = await _coursesClient.GetHomework(task.HomeworkId);
            var course = await _coursesClient.GetCourseById(homework.CourseId);

            var lecturerId = Request.GetUserIdFromHeader();
            if (course != null && lecturerId != null && course.MentorIds.Contains(lecturerId))
            {
                await _solutionsService.RateSolutionAsync(solutionId, lecturerId, rateSolutionModel.Rating, rateSolutionModel.LecturerComment);
                return Ok();
            }

            return Forbid();
        }

        [HttpPost("rateEmptySolution/{taskId}")]
        public async Task<IActionResult> PostEmptySolutionWithRate(long taskId,
            [FromBody] SolutionViewModel solutionViewModel)
        {
            var solution = _mapper.Map<Solution>(solutionViewModel);
            solution.LecturerId = Request.GetUserIdFromHeader()!;
            if (solution.LecturerId == solution.StudentId)
                solution.LecturerId = null;
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

        [HttpGet("getLecturersStat/{courseId}")]
        [ProducesResponseType(typeof(StatisticsLecturerDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetLecturersStat(long courseId)
        {
            var course = await _coursesClient.GetCourseById(courseId);
            if (course == null) return NotFound();

            var userId = Request.GetUserIdFromHeader();

            if (!course.MentorIds.Contains(userId))
                return Forbid();

            var taskIds = course.Homeworks
                .SelectMany(t => t.Tasks)
                .Select(t => t.Id)
                .ToArray();

            var solutions = await _solutionsRepository.FindAll(t => taskIds.Contains(t.TaskId)).ToListAsync();
            var lecturerStat = solutions
                .Where(s => !string.IsNullOrEmpty(s.LecturerId))
                .GroupBy(s => s.LecturerId)
                .Select(group =>
            {
                var lecturerId = group.Key;
                var numberOfSolutions = group.Count();

                var numberOfUniqueSolutions = group
                    .GroupBy(s => (s.TaskId, s.GroupId?.ToString() ?? s.StudentId))
                    .Count();

                return new StatisticsLecturerDTO
                {
                    LecturerId = lecturerId!,
                    NumberOfCheckedSolutions = numberOfSolutions,
                    NumberOfCheckedUniqueSolutions = numberOfUniqueSolutions
                };
            }).ToArray();

            return Ok(lecturerStat);
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
                ? course.AcceptedStudents
                : course.CourseMates.Where(t => t.StudentId == userId);
            var courseGroups = course.Groups;

            var solutionsStatsContext = new StatisticsAggregateModel
            {
                CourseMates = courseMates,
                Homeworks = course.Homeworks.Where(t => t.Tasks.Any()).ToList(),
                Solutions = solutions,
                Groups = courseGroups
            };

            var result = SolutionsStatsDomain.GetCourseStatistics(solutionsStatsContext);
            return Ok(result);
        }

        [HttpGet("getAdvancedStat/{courseId}")]
        [ProducesResponseType(typeof(StatisticsCourseAdvancedDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAdvancedStats(long courseId)
        {
            var course = await _coursesClient.GetCourseById(courseId);
            if (course == null) return NotFound();
            
            var taskIds = course.Homeworks
                .SelectMany(t => t.Tasks)
                .Select(t => t.Id)
                .ToArray();
            var solutions = await _solutionsRepository.FindAll(t => taskIds.Contains(t.TaskId)).ToListAsync();
            
            var averageStudentSolutions = solutions
                .GroupBy(e => new { e.StudentId, e.TaskId })
                .Select(e => e.OrderByDescending(s => s.PublicationDate).First())
                .GroupBy(e => e.TaskId).Select(e => new StatisticsCourseMeasureSolutionModel
                {
                    TaskId = e.Select(t => t.TaskId).First(),
                    Rating = e.Sum(s => s.Rating) / (double)course.CourseMates.Length,
                    PublicationDate = new DateTime((long)e.Average(s => s.PublicationDate.Ticks))
                }).ToArray();
            var bestStudentSolutions = taskIds
                .Select(taskId =>
                {
                    var task = course.Homeworks
                        .SelectMany(e => e.Tasks)
                        .First(t => t.Id == taskId);
                    
                    return new StatisticsCourseMeasureSolutionModel
                    {
                        TaskId = task.Id,
                        Rating = task.MaxRating,
                        PublicationDate = task.PublicationDate ?? DateTime.MinValue
                    };
                }).ToArray();

            var result = new StatisticsCourseAdvancedDto
            {
                CourseId = courseId,
                AverageStudentSolutions = averageStudentSolutions,
                BestStudentSolutions = bestStudentSolutions
            };

            return Ok(result);
        }

        [HttpGet("getTaskStats/{courseId}/{taskId}")]
        [ProducesResponseType(typeof(StudentSolutions[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetTaskStats(long courseId, long taskId)
        {
            var groups = await _coursesClient.GetAllCourseGroups(courseId);

            var solutions = await _solutionsRepository.FindAll(t => t.TaskId == taskId).ToListAsync();
            var solutionsGroups = solutions.Select(s => s.GroupId).Distinct();
            var taskGroups = groups.Where(g => solutionsGroups.Contains(g.Id));

            var result = SolutionsStatsDomain.GetCourseTaskStatistics(solutions, taskGroups);
            return Ok(result);
        }

        [HttpPost("allUnrated")]
        public async Task<SolutionPreviewDto[]> GetAllUnratedSolutionsForTasks([FromBody] long[] taskIds)
        {
            return await _solutionsService.GetAllUnratedSolutions(taskIds);
        }

        [HttpGet("taskSolutionsStats")]
        public async Task<TaskSolutionsStats[]> GetTaskSolutionsStats([FromBody] long[] taskIds)
        {
            return await _solutionsService.GetTaskSolutionsStats(taskIds);
        }
    }
}