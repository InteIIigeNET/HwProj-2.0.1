﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.ExceptionFilters;
using HwProj.APIGateway.API.Extensions;
using HwProj.APIGateway.API.Models.Solutions;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.CoursesService;
using HwProj.Models.CoursesService.DTO;
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
        [ProducesResponseType(typeof(UserTaskSolutionsPageData), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetStudentSolution(long taskId, string studentId)
        {
            var course = await _coursesServiceClient.GetCourseByTask(taskId);
            if (course == null) return NotFound();

            var courseMate = course.AcceptedStudents.FirstOrDefault(t => t.StudentId == studentId);
            if (courseMate == null) return NotFound();

            var studentSolutions = (await _solutionsClient.GetCourseStatistics(course.Id, UserId))
                .Single().Homeworks
                .ToDictionary(x => x.Id);

            var homeworks = course.Homeworks
                .Where(t => t.Tasks.Any())
                .GroupBy(GetGroupingKey)
                .ToList();

            var tasks = homeworks
                .SelectMany(x => x.SelectMany(t => t.Tasks))
                .ToDictionary(t => t.Id);

            // Получаем группы только для выбранной задачи
            var studentsOnCourse = course.AcceptedStudents
                .Select(t => t.StudentId)
                .ToArray();

            var mentorIds = studentSolutions.Values
                .SelectMany(t => t.Tasks)
                .SelectMany(t => t.Solution)
                .Select(t => t.LecturerId ?? "")
                .Where(x => x != "")
                .Distinct()
                .ToArray();

            var accounts = await AuthServiceClient.GetAccountsData(studentsOnCourse.Union(mentorIds).ToArray());

            var solutionsGroupsIds = studentSolutions.Values
                .SelectMany(t => t.Tasks)
                .First(x => x.Id == taskId).Solution
                .Select(s => s.GroupId)
                .Distinct()
                .ToList();

            var accountsCache = accounts.ToDictionary(dto => dto.UserId);

            var solutionsGroups = course.Groups
                .Where(g => solutionsGroupsIds.Contains(g.Id))
                .ToDictionary(t => t.Id);

            var taskSolutions = homeworks.Select(group =>
            {
                var isSingle = group.Count() == 1;
                return new HomeworksGroupUserTaskSolutions
                {
                    GroupTitle = isSingle ? null : group.Key.id,
                    HomeworkSolutions = group.Select(h =>
                        {
                            studentSolutions.TryGetValue(h.Id, out var solutions);
                            return new HomeworkUserTaskSolutions
                            {
                                HomeworkTitle = h.Title,
                                StudentSolutions = solutions!.Tasks.Select(t =>
                                    {
                                        var task = tasks[t.Id];
                                        return new UserTaskSolutions2
                                        {
                                            MaxRating = task.MaxRating,
                                            Title = task.Title,
                                            Tags = task.Tags,
                                            TaskId = task.Id.ToString(),
                                            Solutions = t.Solution.Select(s => new GetSolutionModel(s,
                                                s.TaskId == taskId && s.GroupId is { } groupId
                                                    ? solutionsGroups[groupId].StudentsIds
                                                        .Select(x => accountsCache[x])
                                                        .ToArray()
                                                    : null,
                                                s.LecturerId == null ? null : accountsCache[s.LecturerId])).ToArray()
                                        };
                                    })
                                    .ToArray()
                            };
                        })
                        .ToArray()
                };
            }).ToArray();

            return Ok(new UserTaskSolutionsPageData()
            {
                CourseId = course.Id,
                CourseMates = accounts,
                TaskSolutions = taskSolutions
            });
        }

        // Научить без конкретного taskId по courseId получать данные
        [Authorize]
        [HttpGet("tasks/{taskId}")]
        [ProducesResponseType(typeof(TaskSolutionStatisticsPageData), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetTaskSolutionsPageData(long taskId)
        {
            var course = await _coursesServiceClient.GetCourseByTask(taskId);
            //TODO: CourseMentorOnlyAttribute
            if (course == null || !course.MentorIds.Contains(UserId)) return Forbid();

            var students = course.AcceptedStudents.ToDictionary(x => x.StudentId);
            var studentIds = students.Keys.ToArray();

            var currentDateTime = DateTime.UtcNow;
            var actualHomeworks = course.Homeworks
                .Select(hw =>
                {
                    hw.Tasks = hw.Tasks.Where(t => t.PublicationDate <= currentDateTime).ToList();
                    return hw;
                })
                .Where(hw => hw.Tasks.Count > 0)
                .ToList();

            var homeworks = actualHomeworks
                .GroupBy(GetGroupingKey)
                .ToList();

            var homeworksGroup = homeworks
                .First(g => g.Any(h => h.Tasks.Any(t => t.Id == taskId)))
                .ToList();

            var homeworkIndex = homeworksGroup.FindIndex(t => t.Tasks.Any(x => x.Id == taskId));
            var taskIndex = homeworksGroup[homeworkIndex].Tasks.FindIndex(t => t.Id == taskId);
            var taskVersionIds = homeworksGroup.Select(h => h.Tasks[taskIndex].Id).ToArray();

            var taskIds = homeworks
                .SelectMany(x => x.SelectMany(t => t.Tasks))
                .Select(t => t.Id)
                .ToArray();

            var getUsersDataTask = AuthServiceClient.GetAccountsData(studentIds.Union(course.MentorIds).ToArray());
            var getStatisticsTasks =
                taskVersionIds.Select(x => _solutionsClient.GetTaskSolutionStatistics(course.Id, x)).ToList();
            var getStatsForTasks = _solutionsClient.GetTaskSolutionsStats(
                new GetTasksSolutionsModel
                {
                    StudentIds = studentIds,
                    TaskIds = taskIds
                });

            await Task.WhenAll(getUsersDataTask, Task.WhenAll(getStatisticsTasks), getStatsForTasks);

            var usersData = getUsersDataTask.Result.ToDictionary(t => t.UserId);
            var statistics = taskVersionIds
                .Zip(getStatisticsTasks,
                    (id, solutions) => (id, statistic: solutions.Result.ToDictionary(t => t.StudentId)))
                .ToDictionary(tuple => tuple.id, tuple => tuple.statistic);

            var statsForTasks = getStatsForTasks.Result.ToDictionary(t => t.TaskId);
            var groups = course.Groups.ToDictionary(
                t => t.Id,
                t => t.StudentsIds.Select(s => usersData[s]).ToArray());

            var result = new TaskSolutionStatisticsPageData()
            {
                CourseId = course.Id,
                TaskSolutions = taskVersionIds.Select(tId =>
                {
                    statistics.TryGetValue(tId, out var statistic);
                    return new TaskSolutions
                    {
                        TaskId = tId,
                        StudentSolutions = studentIds.Select(studentId => new UserTaskSolutions
                            {
                                Solutions = statistic!.TryGetValue(studentId, out var studentSolutions)
                                    ? studentSolutions.Solutions.Select(t => new GetSolutionModel(t,
                                        t.GroupId is { } groupId ? groups[groupId] : null,
                                        t.LecturerId == null ? null : usersData[t.LecturerId])).ToArray()
                                    : Array.Empty<GetSolutionModel>(),
                                Student = new StudentDataDto(usersData[studentId])
                                {
                                    Characteristics = students[studentId].Characteristics,
                                }
                            })
                            .OrderBy(t => t.Student.Surname)
                            .ThenBy(t => t.Student.Name)
                            .ToArray(),
                    };
                }).ToArray(),
                StatsForTasks = homeworks.Select(group =>
                {
                    var isSingle = homeworks.Count == 1;
                    return new HomeworksGroupSolutionStats()
                    {
                        GroupTitle = isSingle ? null : group.Key.id,
                        StatsForHomeworks = group.Select(h => new HomeworkSolutionsStats
                        {
                            HomeworkTitle = h.Title,
                            StatsForTasks = h.Tasks.Select(t =>
                            {
                                var stats = statsForTasks.TryGetValue(t.Id, out var taskStats)
                                    ? taskStats
                                    : new TaskSolutionsStats();

                                stats.Title = t.Title;
                                stats.Tags = t.Tags;
                                return stats;
                            }).ToArray()
                        }).ToArray()
                    };
                }).ToArray()
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

            var courseMate = course.AcceptedStudents.FirstOrDefault(t => t.StudentId == solutionModel.StudentId);
            if (courseMate == null) return BadRequest($"Студента с id {solutionModel.StudentId} не существует");

            if (model.GroupMateIds == null || model.GroupMateIds.Length == 0)
            {
                var result = await _solutionsClient.PostSolution(taskId, solutionModel);
                return Ok(result);
            }

            var fullStudentsGroup = model.GroupMateIds.ToList();
            fullStudentsGroup.Add(solutionModel.StudentId);
            var arrFullStudentsGroup = fullStudentsGroup.Distinct().ToArray();

            if (arrFullStudentsGroup.Intersect(course.CourseMates.Select(x => x.StudentId)).Count() !=
                arrFullStudentsGroup.Length)
            {
                return BadRequest();
            }

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
        [Authorize(Roles = Roles.LecturerOrExpertRole)]
        public async Task<IActionResult> PostEmptySolutionWithRate(long taskId, SolutionViewModel solution)
        {
            var course = await _coursesServiceClient.GetCourseByTask(taskId);
            if (course == null || !course.MentorIds.Contains(UserId)) return Forbid();
            if (course.CourseMates.All(t => t.StudentId != solution.StudentId))
                return BadRequest($"Студент с id {solution.StudentId} не записан на курс");

            solution.Comment = "[Решение было сдано вне сервиса]";
            await _solutionsClient.PostEmptySolutionWithRate(taskId, solution);
            return Ok();
        }

        [HttpPost("giveUp/{taskId}")]
        [Authorize(Roles = Roles.StudentRole)]
        public async Task<IActionResult> GiveUp(long taskId)
        {
            var course = await _coursesServiceClient.GetCourseByTask(taskId);
            if (course == null) return NotFound();
            if (course.CourseMates.All(t => t.StudentId != UserId))
                return BadRequest($"Студент с id {UserId} не записан на курс");

            await _solutionsClient.PostEmptySolutionWithRate(taskId, new SolutionViewModel()
            {
                StudentId = UserId,
                Comment = "[Студент отказался от выполнения задачи]",
                Rating = 0
            });
            return Ok();
        }

        [HttpPost("rateSolution/{solutionId}")]
        [Authorize(Roles = Roles.LecturerOrExpertRole)]
        public async Task<IActionResult> RateSolution(long solutionId,
            RateSolutionModel rateSolutionModel)
        {
            await _solutionsClient.RateSolution(solutionId, rateSolutionModel);
            return Ok();
        }

        [HttpGet("actuality/{solutionId}")]
        [ProducesResponseType(typeof(SolutionActualityDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetSolutionActuality(long solutionId)
        {
            var result = await _solutionsClient.GetSolutionActuality(solutionId);
            return Ok(result);
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
        [Authorize(Roles = Roles.LecturerOrExpertRole)]
        public async Task<UnratedSolutionPreviews> GetUnratedSolutions(long? taskId)
        {
            var mentorCourses = await _coursesServiceClient.GetAllUserCourses();
            var tasks = FilterTasks(mentorCourses, taskId).ToDictionary(t => t.taskId, t => t.data);

            var studentsAndTasks = new Dictionary<long, (List<string> studentIds, List<long> taskIds)>();
            foreach (var value in tasks.Values)
            {
                studentsAndTasks.TryAdd(
                    value.course.Id, (
                        value.course.AcceptedStudents.Select(ast => ast.StudentId).ToList(),
                        new List<long>()));
                studentsAndTasks[value.course.Id].taskIds.Add(value.task.Id);
            }

            var solutions = await GetAllUnratedSolutionsForTasks(studentsAndTasks);

            var studentIds = solutions.Select(t => t.StudentId).Distinct().ToArray();
            var accountsData = await AuthServiceClient.GetAccountsData(studentIds);

            var unratedSolutions = solutions
                .Join(accountsData, s => s.StudentId, s => s.UserId, (solution, account) =>
                {
                    var (course, homeworkTitle, task) = tasks[solution.TaskId];
                    return new SolutionPreviewView
                    {
                        SolutionId = solution.SolutionId,
                        Student = account,
                        CourseTitle = $"{course.Name} / {course.GroupName}",
                        CourseId = course.Id,
                        HomeworkTitle = homeworkTitle,
                        TaskTitle = task.Title,
                        TaskId = task.Id,
                        PublicationDate = solution.PublicationDate,
                        IsFirstTry = solution.IsFirstTry,
                        GroupId = solution.GroupId,
                        SentAfterDeadline = solution.IsFirstTry && task.DeadlineDate != null &&
                                            solution.PublicationDate > task.DeadlineDate,
                        IsCourseCompleted = course.IsCompleted
                    };
                })
                .ToArray();

            return new UnratedSolutionPreviews
            {
                UnratedSolutions = unratedSolutions,
            };
        }

        [Authorize]
        [HttpGet("solutionAchievement")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetSolutionAchievement(long taskId, long solutionId)
        {
            var course = await _coursesServiceClient.GetCourseByTask(taskId);
            if (course is null) return BadRequest();

            var isMentor = course.MentorIds.Contains(UserId);
            if (!isMentor &&
                course.AcceptedStudents.FirstOrDefault(t => t.StudentId == UserId) == null)
                return BadRequest($"Студента или преподавателя с id {UserId} не существует");

            var solutions = await _solutionsClient.GetTaskSolutionStatistics(course.Id, taskId);
            var lastRatedSolutions = solutions
                .Select(t => t.Solutions.LastOrDefault(x => x.State != SolutionState.Posted))
                .Where(t => t != null)
                .ToArray();

            var solution = lastRatedSolutions.FirstOrDefault(t => t!.Id == solutionId &&
                                                                  (isMentor || t.StudentId == UserId));
            if (solution == null) return NotFound();

            if (lastRatedSolutions.Any(x => x!.GroupId != null))
                lastRatedSolutions = lastRatedSolutions.DistinctBy(t => t!.Id).ToArray();

            var betterThanCount = lastRatedSolutions.Count(t => solution.Rating > t!.Rating);
            if (betterThanCount == 0) return Ok(lastRatedSolutions.Length == 1 ? 100 : 0);
            return Ok(betterThanCount * 100 / (lastRatedSolutions.Length - 1));
        }

        private async Task<SolutionPreviewDto[]> GetAllUnratedSolutionsForTasks(
            Dictionary<long, (List<string> studentIds, List<long> taskIds)> tasksAndStudents)
        {
            var solutions = new List<Task<SolutionPreviewDto[]>>();

            foreach (var value in tasksAndStudents.Values)
            {
                solutions.Add(
                    _solutionsClient.GetAllUnratedSolutionsForTasks(
                        new GetTasksSolutionsModel
                        {
                            TaskIds = value.taskIds.ToArray(),
                            StudentIds = value.studentIds.ToArray()
                        }
                    )
                );
            }

            var allSolutions = await Task.WhenAll(solutions);
            return allSolutions.SelectMany(s => s).OrderBy(s => s.PublicationDate).ToArray();
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

        private static (string id, string tasks) GetGroupingKey(HomeworkViewModel homework)
        {
            var isTest = homework.Tags.Contains(HomeworkTags.Test);
            var groupingTag = homework.Tags.Except(HomeworkTags.DefaultTags).FirstOrDefault();
            return isTest && groupingTag != null
                ? (groupingTag, string.Join(";", homework.Tasks.Select(t => t.MaxRating)))
                : (homework.Id.ToString(), "");
        }
    }
}
