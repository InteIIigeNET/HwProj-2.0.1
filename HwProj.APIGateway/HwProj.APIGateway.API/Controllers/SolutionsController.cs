using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.ExceptionFilters;
using HwProj.APIGateway.API.Models.Solutions;
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
    [ForbiddenExceptionFilter]
    public class SolutionsController : AggregationController
    {
        private readonly ISolutionsServiceClient _solutionsClient;
        private readonly ICoursesServiceClient _coursesServiceClient;

        public SolutionsController(ISolutionsServiceClient solutionsClient, IAuthServiceClient authServiceClient,
            ICoursesServiceClient coursesServiceClient) :
            base(authServiceClient)
        {
            _solutionsClient = solutionsClient;
            _coursesServiceClient = coursesServiceClient;
        }

        [HttpGet]
        [ProducesResponseType(typeof(Solution[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllSolutions()
        {
            var result = await _solutionsClient.GetAllSolutions();
            return Ok(result);
        }

        [HttpGet("{solutionId}")]
        [ProducesResponseType(typeof(Solution), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetSolutionById(long solutionId)
        {
            var result = await _solutionsClient.GetSolutionById(solutionId);
            return result == null
                ? NotFound() as IActionResult
                : Ok(result);
        }

        [HttpGet("taskSolution/{taskId}/{studentId}")]
        [Authorize]
        public async Task<UserTaskSolutions> GetStudentSolution(long taskId, string studentId)
        {
            var getSolutionsTask = _solutionsClient.GetUserSolutions(taskId, studentId);
            var getUserTask = AuthServiceClient.GetAccountData(studentId);

            await Task.WhenAll(getSolutionsTask, getUserTask);

            var result = new UserTaskSolutions
            {
                User = getUserTask.Result,
                Solutions = getSolutionsTask.Result,
            };
            return result;
        }

        [Authorize]
        [HttpGet("tasks/{taskId}")]
        [ProducesResponseType(typeof(TaskSolutionStatisticsPageData), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetTaskSolutionsPageData(long taskId)
        {
            var course = await _coursesServiceClient.GetCourseByTask(taskId);
            //TODO: CourseMentorOnlyAttribute
            if (course == null || !course.MentorIds.Contains(UserId)) return Forbid();

            var studentIds = course.CourseMates
                .Where(t => t.IsAccepted)
                .Select(t => t.StudentId)
                .ToArray();

            var getStudentsDataTask = AuthServiceClient.GetAccountsData(studentIds);
            var getStatisticsTask = _solutionsClient.GetTaskSolutionStatistics(taskId);

            await Task.WhenAll(getStudentsDataTask, getStatisticsTask);

            var usersData = getStudentsDataTask.Result;
            var statistics = getStatisticsTask.Result;
            var statisticsDict = statistics.ToDictionary(t => t.StudentId);

            var result = new TaskSolutionStatisticsPageData()
            {
                CourseId = course.Id,
                StudentsSolutions = studentIds.Zip(usersData, (studentId, accountData) => new UserTaskSolutions
                    {
                        Solutions = statisticsDict.TryGetValue(studentId, out var studentSolutions)
                            ? studentSolutions.Solutions
                            : Array.Empty<Solution>(),
                        User = accountData
                    })
                    .OrderBy(t => t.User.Surname)
                    .ThenBy(t => t.User.Name)
                    .ToArray()
            };

            return Ok(result);
        }

        [HttpPost("{taskId}")]
        [Authorize]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostSolution(SolutionViewModel model, long taskId)
        {
            model.StudentId = UserId;
            var result = await _solutionsClient.PostSolution(model, taskId);
            return Ok(result);
        }

        [HttpPost("rateEmptySolution/{taskId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> PostEmptySolutionWithRate(long taskId, SolutionViewModel model)
        {
            var course = await _coursesServiceClient.GetCourseByTask(taskId);
            if (course == null || !course.MentorIds.Contains(UserId)) return Forbid();
            if (course.CourseMates.All(t => t.StudentId != model.StudentId))
                return BadRequest($"Студента с id {model.StudentId} не существует");

            await _solutionsClient.PostEmptySolutionWithRate(taskId, model);
            return Ok();
        }

        [HttpPost("rateSolution/{solutionId}/{newRating}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> RateSolution(long solutionId, int newRating,
            [FromQuery] string lecturerComment)
        {
            await _solutionsClient.RateSolution(solutionId, newRating, lecturerComment, UserId);
            return Ok();
        }

        [HttpPost("markSolutionFinal/{solutionId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> MarkSolution(long solutionId)
        {
            await _solutionsClient.MarkSolution(solutionId);
            return Ok();
        }

        [HttpDelete("delete/{solutionId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> DeleteSolution(long solutionId)
        {
            await _solutionsClient.DeleteSolution(solutionId);
            return Ok();
        }

        [HttpPost("{groupId}/{taskId}")]
        [Authorize]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostGroupSolution(SolutionViewModel model, long taskId, long groupId)
        {
            var result = await _solutionsClient.PostGroupSolution(model, taskId, groupId);
            return Ok(result);
        }

        [HttpGet("{groupId}/taskSolutions/{taskId}")]
        [Authorize]
        [ProducesResponseType(typeof(Solution[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetGroupSolutions(long groupId, long taskId)
        {
            var result = await _solutionsClient.GetTaskSolutions(groupId, taskId);
            return result == null
                ? NotFound() as IActionResult
                : Ok(result);
        }

        [HttpGet("unratedSolutions")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<UnratedSolutionPreviews> GetUnratedSolutions(long? taskId)
        {
            var mentorCourses = await _coursesServiceClient.GetAllUserCourses();
            var tasks = FilterTasks(mentorCourses, taskId).ToDictionary(t => t.taskId, t => t.data);

            var taskIds = tasks.Select(t => t.Key).ToArray();
            var solutions = await _solutionsClient.GetAllUnratedSolutionsForTasks(taskIds);

            var studentIds = solutions.Select(t => t.StudentId).Distinct().ToArray();
            var accountsData = await AuthServiceClient.GetAccountsData(studentIds);

            var unratedSolutions = solutions
                .Join(accountsData, s => s.StudentId, s => s.UserId, (solution, account) =>
                {
                    var (course, homeworkTitle, task) = tasks[solution.TaskId];
                    return new SolutionPreviewView
                    {
                        Student = account,
                        CourseTitle = $"{course.Name} / {course.GroupName}",
                        CourseId = course.Id,
                        HomeworkTitle = homeworkTitle,
                        TaskTitle = task.Title,
                        TaskId = task.Id,
                        PublicationDate = solution.PublicationDate,
                        IsFirstTry = solution.IsFirstTry,
                        SentAfterDeadline = solution.IsFirstTry && task.DeadlineDate != null &&
                                            solution.PublicationDate > task.DeadlineDate
                    };
                })
                .ToArray();

            return new UnratedSolutionPreviews
            {
                UnratedSolutions = unratedSolutions,
            };
        }

        private static IEnumerable<(long taskId,
                (CourseDTO course, string homeworkTitle, HomeworkTaskViewModel task) data)>
            FilterTasks(CourseDTO[] courses, long? taskId)
        {
            foreach (var course in courses)
            foreach (var homework in course.Homeworks)
            foreach (var task in homework.Tasks)
            {
                if (taskId is { } id && task.Id == id)
                {
                    yield return (task.Id, (course, homework.Title, task));
                    yield break;
                }

                if (!taskId.HasValue)
                    yield return (task.Id, (course, homework.Title, task));
            }
        }
    }
}
