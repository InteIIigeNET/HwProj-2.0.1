using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;
using HwProj.NotificationService.Events.SolutionsService;
using HwProj.SolutionsService.API.Domains;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Octokit;

namespace HwProj.SolutionsService.API.Services
{
    public class SolutionsService : ISolutionsService
    {
        private readonly ISolutionsRepository _solutionsRepository;
        private readonly IEventBus _eventBus;
        private readonly IMapper _mapper;
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IGithubSolutionCommitsRepository _githubSolutionCommitsRepository;
        private readonly IConfiguration _configuration;

        public SolutionsService(
            ISolutionsRepository solutionsRepository,
            IEventBus eventBus,
            IMapper mapper,
            ICoursesServiceClient coursesServiceClient,
            IAuthServiceClient authServiceClient,
            IGithubSolutionCommitsRepository githubSolutionCommitsRepository,
            IConfiguration configuration)
        {
            _solutionsRepository = solutionsRepository;
            _eventBus = eventBus;
            _mapper = mapper;
            _coursesServiceClient = coursesServiceClient;
            _authServiceClient = authServiceClient;
            _githubSolutionCommitsRepository = githubSolutionCommitsRepository;
            _configuration = configuration;
        }

        public async Task<Solution[]> GetAllSolutionsAsync()
        {
            return await _solutionsRepository.GetAll().ToArrayAsync();
        }

        public Task<Solution> GetSolutionAsync(long solutionId)
        {
            return _solutionsRepository.GetAsync(solutionId);
        }

        public async Task<Solution[]> GetTaskSolutionsFromStudentAsync(long taskId, string studentId)
        {
            var course = await _coursesServiceClient.GetCourseByTask(taskId);
            if (course == null) return Array.Empty<Solution>();

            var studentGroupsIds = course.Groups
                .Where(g => g.StudentsIds.Contains(studentId))
                .Select(g => g.Id);

            return await _solutionsRepository
                .FindAll(solution => solution.TaskId == taskId &&
                                     (solution.StudentId == studentId ||
                                      studentGroupsIds.Contains(solution.GroupId ?? 0)))
                .OrderBy(t => t.PublicationDate)
                .ToArrayAsync();
        }

        public async Task<Solution?[]> GetLastTaskSolutions(long[] taskIds, string studentId)
        {
            var potentialSolutions = await _solutionsRepository
                .FindAll(s => taskIds.Contains(s.TaskId))
                .Where(s => s.StudentId == studentId || s.GroupId != null)
                .ToArrayAsync();

            var groupIds = potentialSolutions
                .Where(s => s is { GroupId: { } })
                .Select(s => s!.GroupId!.Value)
                .Distinct()
                .ToArray();

            var groups = await _coursesServiceClient.GetGroupsById(groupIds);
            var studentGroups = groups
                .Where(x => x.StudentsIds.Contains(studentId))
                .Select(t => t.Id)
                .ToList();

            var solutions = potentialSolutions
                .Where(t => t.GroupId == null || studentGroups.Contains(t.GroupId.Value))
                .GroupBy(t => t.TaskId)
                .Select(t => t.OrderByDescending(s => s.PublicationDate).FirstOrDefault())
                .ToList();

            return taskIds.Select(t => solutions.FirstOrDefault(s => s?.TaskId == t)).ToArray();
        }

        public async Task<long> PostOrUpdateAsync(long taskId, Solution solution)
        {
            solution.PublicationDate = DateTime.UtcNow;
            solution.TaskId = taskId;

            var task = await _coursesServiceClient.GetTask(solution.TaskId);

            var lastSolution =
                await _solutionsRepository
                    .FindAll(s => s.TaskId == taskId && s.StudentId == solution.StudentId)
                    .OrderByDescending(t => t.PublicationDate)
                    .FirstOrDefaultAsync();

            long? solutionId;

            if (lastSolution != null && lastSolution.State == SolutionState.Posted)
            {
                var IsModified = ...;
                IsModified = IsModified;
                await _solutionsRepository.UpdateAsync(lastSolution.Id, x => new Solution
                {
                    GithubUrl = solution.GithubUrl,
                    Comment = solution.Comment,
                    GroupId = solution.GroupId,
                    if (lastSolution.GithubUrl != solution.GithubUrl || lastSolution.Comment != solution.Comment)
                    {
                        IsModified = true;
                    }
                    State = SolutionState.Posted,
                });
                solutionId = lastSolution.Id;
            }
            else
            {
                solutionId = await _solutionsRepository.AddAsync(solution);

                var solutionModel = _mapper.Map<SolutionViewModel>(solution);
                var course = await _coursesServiceClient.GetCourseByTask(solution.TaskId);
                var student = await _authServiceClient.GetAccountData(solutionModel.StudentId);
                var studentModel = _mapper.Map<AccountDataDto>(student);
                _eventBus.Publish(new StudentPassTaskEvent(course, solutionModel, studentModel, task));
            }

            if (task.Tags.Contains(HomeworkTags.Test))
                await TrySaveSolutionCommitsInfo(solutionId.Value, solution.GithubUrl);
            return solutionId.Value;
        }

        public async Task PostEmptySolutionWithRateAsync(long taskId, Solution solution)
        {
            var hasSolution = await _solutionsRepository
                .FindAll(s => s.TaskId == taskId && s.StudentId == solution.StudentId)
                .AnyAsync();

            if (hasSolution) throw new InvalidOperationException("У студента имеются решения");
            var currentTime = DateTime.UtcNow;

            solution.PublicationDate = currentTime;
            solution.RatingDate = currentTime;
            solution.TaskId = taskId;
            var id = await _solutionsRepository.AddAsync(solution);
            await RateSolutionAsync(id, solution.LecturerId!, solution.Rating, solution.LecturerComment);
        }

        public async Task RateSolutionAsync(long solutionId, string lecturerId, int newRating, string lecturerComment)
        {
            if (0 <= newRating)
            {
                var ratingDate = DateTime.UtcNow;
                var solution = await _solutionsRepository.GetAsync(solutionId);
                var task = await _coursesServiceClient.GetTask(solution.TaskId);
                var state = newRating >= task.MaxRating ? SolutionState.Final : SolutionState.Rated;
                await _solutionsRepository
                    .RateSolutionAsync(solutionId, state, lecturerId, newRating, ratingDate, lecturerComment);

                var solutionModel = _mapper.Map<SolutionViewModel>(solution);
                solutionModel.LecturerComment = lecturerComment;
                solutionModel.Rating = newRating;
                _eventBus.Publish(new RateEvent(task, solutionModel));
            }
        }

        public async Task DeleteSolutionAsync(long solutionId)
        {
            await _solutionsRepository.DeleteAsync(solutionId);
        }

        public async Task MarkSolutionFinal(long solutionId)
        {
            await _solutionsRepository.UpdateSolutionState(solutionId, SolutionState.Final);
        }

        public async Task<SolutionPreviewDto[]> GetAllUnratedSolutions(GetTasksSolutionsModel model)
        {
            var taskIds = model.TaskIds;
            var studentIds = model.StudentIds;
            var getSolutionsQuery = studentIds == null
                ? _solutionsRepository.FindAll(t => taskIds.Contains(t.TaskId))
                : _solutionsRepository.FindAll(t => taskIds.Contains(t.TaskId) && studentIds.Contains(t.StudentId));

            var groupIds = await getSolutionsQuery
                .Where(t => t.GroupId != null)
                .Select(s => s.GroupId!.Value)
                .Distinct()
                .ToArrayAsync();

            if (groupIds.Any())
            {
                var groups = await _coursesServiceClient.GetGroupsById(groupIds);

                return (await getSolutionsQuery.ToListAsync())
                    .GroupBy(t => t.TaskId)
                    .Select(t =>
                        (t.Key, TaskSolutions: SolutionsStatsDomain.GetCourseTaskStatistics(t.ToList(), groups)))
                    .SelectMany(grouped => grouped.TaskSolutions.Select(studentSolutions =>
                    {
                        var lastSolution = studentSolutions.Solutions.Last();
                        return lastSolution.State == SolutionState.Posted
                            ? new SolutionPreviewDto
                            {
                                StudentId = studentSolutions.StudentId,
                                TaskId = grouped.Key,
                                SolutionId = lastSolution.Id,
                                GroupId = lastSolution.GroupId,
                                PublicationDate = lastSolution.PublicationDate,
                                IsFirstTry = studentSolutions.Solutions.All(s => s.State == SolutionState.Posted)
                            }
                            : null;
                    }))
                    .Where(t => t != null)
                    .OrderBy(t => t!.PublicationDate)
                    .ToArray();
            }

            return await getSolutionsQuery.GroupBy(t => new { t.TaskId, t.StudentId })
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
                    SolutionId = t.LastSolution.Id,
                    GroupId = t.LastSolution.GroupId,
                    TaskId = t.LastSolution.TaskId,
                    PublicationDate = t.LastSolution.PublicationDate,
                    IsFirstTry = t.IsFirstTry
                })
                .ToArrayAsync();
        }

        public async Task<TaskSolutionsStats[]> GetTaskSolutionsStats(GetTasksSolutionsModel tasksSolutionsModel)
        {
            var unratedSolutions = await GetAllUnratedSolutions(tasksSolutionsModel);
            var statsSolutions = unratedSolutions
                .GroupBy(s => s.TaskId)
                .Select(s => new TaskSolutionsStats
                {
                    TaskId = s.Key,
                    CountUnratedSolutions = s.Count()
                }).ToDictionary(t => t.TaskId);

            return tasksSolutionsModel.TaskIds.Select(t => statsSolutions.TryGetValue(t, out var value)
                ? value
                : new TaskSolutionsStats
                {
                    TaskId = t,
                    CountUnratedSolutions = 0
                }).ToArray();
        }

        public async Task<Solution[]> GetTaskSolutionsFromGroupAsync(long taskId, long groupId)
        {
            return await _solutionsRepository.FindAll(cm => cm.GroupId == groupId).ToArrayAsync();
        }

        public async Task<SolutionActualityDto> GetSolutionActuality(long solutionId)
        {
            var solution = await _solutionsRepository.GetAsync(solutionId) ??
                           throw new ArgumentException(nameof(solutionId));
            var task = await _coursesServiceClient.GetTask(solution.TaskId);
            var isTestWork = task.Tags.Contains(HomeworkTags.Test);

            var solutionsActuality = new SolutionActualityDto
            {
                CommitsActuality = null,
                TestsActuality = null
            };

            var client = CreateGitHubClient();

            var pullRequest = SolutionHelper.TryParsePullRequestUrl(solution.GithubUrl);
            if (pullRequest == null) return solutionsActuality;

            try
            {
                var commits =
                    await client.PullRequest.Commits(pullRequest.Owner, pullRequest.RepoName, pullRequest.Number)
                    ?? Array.Empty<PullRequestCommit>();

                if (isTestWork)
                {
                    var lastSolutionCommit = await _githubSolutionCommitsRepository.TryGetLastBySolutionId(solutionId);
                    solutionsActuality.CommitsActuality =
                        SolutionHelper.GetCommitActuality(commits, lastSolutionCommit);
                }

                if (!(commits.LastOrDefault() is { } lastCommit)) return solutionsActuality;

                var suite = await client.Check.Suite.GetAllForReference(pullRequest.Owner, pullRequest.RepoName,
                    lastCommit.Sha);

                if (suite == null || suite.CheckSuites.Count == 0) return solutionsActuality;

                var conclusion = suite.CheckSuites.Last().Conclusion?.Value;
                if (conclusion == null) return solutionsActuality;

                solutionsActuality.TestsActuality = new SolutionActualityPart
                {
                    isActual = conclusion == CheckConclusion.Success,
                    Comment = conclusion switch
                    {
                        CheckConclusion.Success => "Все тесты успешно пройдены.",
                        CheckConclusion.Failure => "Тесты завершились с ошибками.",
                        var x => $"Тесты завершились со статусом '{x}'."
                    },
                    AdditionalData = conclusion switch
                    {
                        CheckConclusion.Success => "",
                        CheckConclusion.Failure => "",
                        _ => "Some"
                    }
                };
            }
            catch (Exception ex)
            {
                var result = new SolutionActualityPart
                {
                    isActual = false,
                    Comment = $"Ошибка при чтении пулл-реквеста: {ex.Message}",
                    AdditionalData = ""
                };
                solutionsActuality.CommitsActuality = result;
                solutionsActuality.TestsActuality = result;
            }

            return solutionsActuality;
        }

        private async Task TrySaveSolutionCommitsInfo(long solutionId, string solutionUrl)
        {
            var client = CreateGitHubClient();
            var pullRequest = SolutionHelper.TryParsePullRequestUrl(solutionUrl);
            if (pullRequest == null) return;

            var commits = await client.PullRequest.Commits(pullRequest.Owner, pullRequest.RepoName, pullRequest.Number)
                          ?? Array.Empty<PullRequestCommit>();
            var lastCommitSha = commits.LastOrDefault()?.Sha;
            if (lastCommitSha is null) return;

            var lastSolutionCommit = await _githubSolutionCommitsRepository.TryGetLastBySolutionId(solutionId);

            if (lastSolutionCommit == null)
                await _githubSolutionCommitsRepository.AddAsync(new GithubSolutionCommit
                {
                    Id = solutionId,
                    CommitHash = lastCommitSha
                });

            else
                await _githubSolutionCommitsRepository.UpdateAsync(lastSolutionCommit.Id, x => new GithubSolutionCommit
                {
                    CommitHash = lastCommitSha
                });
        }

        private GitHubClient CreateGitHubClient()
        {
            const string productName = "Hwproj";
            var token = _configuration.GetSection("Github")["Token"];

            return new GitHubClient(new ProductHeaderValue(productName))
            {
                Credentials = new Credentials(token)
            };
        }
    }
}
