using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.ExceptionFilters;
using HwProj.APIGateway.API.Models.Solutions;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Roles;
using HwProj.Models.SolutionsService;
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
        [ProducesResponseType(typeof(UserTaskSolutions), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetStudentSolution(long taskId, string studentId)
        {
            var course = await _coursesServiceClient.GetCourseByTask(taskId);
            if (course == null) return NotFound();

            var courseMate = course.CourseMates.FirstOrDefault(t => t.StudentId == studentId);
            if (courseMate == null || !courseMate.IsAccepted)
                return NotFound();

            var student = await AuthServiceClient.GetAccountData(studentId);
            var studentSolutions = await _solutionsClient.GetUserSolutions(taskId, studentId);

            var solutionsGroupsIds = studentSolutions
                .Select(s => s.GroupId)
                .Distinct();
            var solutionsGroups = course.Groups
                .Where(g => solutionsGroupsIds.Contains(g.Id))
                .ToDictionary(t => t.Id);

            var groupMatesIds = course.Groups
                .Where(g => solutionsGroupsIds.Contains(g.Id))
                .SelectMany(g => g.StudentsIds)
                .Distinct()
                .ToArray();
            var groupMates = groupMatesIds.Any()
                ? await AuthServiceClient.GetAccountsData(groupMatesIds)
                : Array.Empty<AccountDataDto>();

            var solutions = studentSolutions
                .Select(s =>
                    new GetSolutionModel(s,
                        s.GroupId is { } groupId
                            ? groupMates
                                .Where(t => solutionsGroups[groupId].StudentsIds.Contains(t.UserId))
                                .ToArray()
                            : null))
                .ToArray();

            return Ok(new UserTaskSolutions()
            {
                User = student,
                Solutions = solutions
            });
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

            var currentDateTime = DateTimeUtils.GetMoscowNow();
            var tasks = course.Homeworks
                .SelectMany(t => t.Tasks)
                .Where(t => t.PublicationDate <= currentDateTime)
                .ToList();

            var taskIds = tasks.Select(t => t.Id).ToArray();

            var getStudentsDataTask = AuthServiceClient.GetAccountsData(studentIds);
            var getStatisticsTask = _solutionsClient.GetTaskSolutionStatistics(course.Id, taskId);
            var getStatsForTasks = _solutionsClient.GetTaskSolutionsStats(taskIds);

            await Task.WhenAll(getStudentsDataTask, getStatisticsTask, getStatsForTasks);

            var usersData = getStudentsDataTask.Result.ToDictionary(t => t.UserId);
            var statistics = getStatisticsTask.Result.ToDictionary(t => t.StudentId);
            var statsForTasks = getStatsForTasks.Result;
            var groups = course.Groups.ToDictionary(
                t => t.Id,
                t => t.StudentsIds.Select(s => usersData[s]).ToArray());

            for (var i = 0; i < statsForTasks.Length; i++) statsForTasks[i].Title = tasks[i].Title;

            var result = new TaskSolutionStatisticsPageData()
            {
                CourseId = course.Id,
                StudentsSolutions = studentIds.Select(studentId => new UserTaskSolutions
                    {
                        Solutions = statistics.TryGetValue(studentId, out var studentSolutions)
                            ? studentSolutions.Solutions.Select(t => new GetSolutionModel(t,
                                t.GroupId is { } groupId ? groups[groupId] : null)).ToArray()
                            : Array.Empty<GetSolutionModel>(),
                        User = usersData[studentId]
                    })
                    .OrderBy(t => t.User.Surname)
                    .ThenBy(t => t.User.Name)
                    .ToArray(),
                StatsForTasks = statsForTasks
            };

            return Ok(result);
        }

        [HttpPost("{taskId}")]
        [Authorize(Roles = Roles.StudentRole)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostSolution(SolutionViewModel model, long taskId)
        {
            var solutionModel = new PostSolutionModel(model)
            {
                StudentId = UserId
            };

            var course = await _coursesServiceClient.GetCourseByTask(taskId);
            if (course is null) return BadRequest();

            var courseMate = course.CourseMates.FirstOrDefault(t => t.StudentId == solutionModel.StudentId);
            if (courseMate == null || !courseMate.IsAccepted)
                return BadRequest($"Студента с id {solutionModel.StudentId} не существует");

            if (model.GroupMateIds == null || model.GroupMateIds.Length == 0)
            {
                var result = await _solutionsClient.PostSolution(taskId, solutionModel);
                return Ok(result);
            }

            var fullStudentsGroup = model.GroupMateIds.ToList();
            fullStudentsGroup.Add(solutionModel.StudentId);
            var arrFullStudentsGroup = fullStudentsGroup.Distinct().ToArray();

            if (arrFullStudentsGroup.Intersect(course.CourseMates.Select(x =>
                    x.StudentId)).Count() != arrFullStudentsGroup.Length) return BadRequest();

            var existedGroup = course.Groups.SingleOrDefault(x =>
                x.StudentsIds.Length == arrFullStudentsGroup.Length &&
                x.StudentsIds.Intersect(arrFullStudentsGroup).Count() == arrFullStudentsGroup.Length);

            solutionModel.GroupId =
                existedGroup?.Id ??
                await _coursesServiceClient.CreateCourseGroup(new CreateGroupViewModel(arrFullStudentsGroup, course.Id),
                    taskId);

            await _solutionsClient.PostSolution(taskId, solutionModel);
            return Ok(solutionModel);
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

        [HttpPost("rateSolution/{solutionId}")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<IActionResult> RateSolution(long solutionId, 
            RateSolutionModel rateSolutionModel)
        {
            await _solutionsClient.RateSolution(solutionId, rateSolutionModel);
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
