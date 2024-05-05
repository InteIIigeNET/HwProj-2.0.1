﻿using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.SolutionsService;
using HwProj.Models.StatisticsService;
using HwProj.SolutionsService.API.Domains;
using HwProj.SolutionsService.API.Events;
using HwProj.SolutionsService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.SolutionsService.API.Services
{
    public class SolutionsService : ISolutionsService
    {
        private readonly ISolutionsRepository _solutionsRepository;
        private readonly IEventBus _eventBus;
        private readonly IMapper _mapper;
        private readonly ICoursesServiceClient _coursesServiceClient;
        private readonly IAuthServiceClient _authServiceClient;

        public SolutionsService(ISolutionsRepository solutionsRepository, IEventBus eventBus, IMapper mapper,
            ICoursesServiceClient coursesServiceClient, IAuthServiceClient authServiceClient)
        {
            _solutionsRepository = solutionsRepository;
            _eventBus = eventBus;
            _mapper = mapper;
            _coursesServiceClient = coursesServiceClient;
            _authServiceClient = authServiceClient;
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
            var allSolutionsForTask = await GetTaskSolutionsFromStudentAsync(taskId, solution.StudentId);
            var currentSolution = allSolutionsForTask.FirstOrDefault(s => s.Id == solution.Id);
            var solutionModel = _mapper.Map<SolutionViewModel>(solution);
            var task = await _coursesServiceClient.GetTask(solution.TaskId);
            var homework = await _coursesServiceClient.GetHomework(task.HomeworkId);
            var courses = await _coursesServiceClient.GetCourseById(homework.CourseId);
            var student = await _authServiceClient.GetAccountData(solutionModel.StudentId);
            var studentModel = _mapper.Map<AccountDataDto>(student);
            _eventBus.Publish(new StudentPassTaskEvent(courses, solutionModel, studentModel, task));

            if (currentSolution == null)
            {
                solution.TaskId = taskId;
                var id = await _solutionsRepository.AddAsync(solution);
                return id;
            }

            await _solutionsRepository.UpdateAsync(currentSolution.Id, s => new Solution()
                {
                    State = SolutionState.Rated,
                    Comment = solution.Comment,
                    GithubUrl = solution.GithubUrl,
                    PublicationDate = solution.PublicationDate,
                }
            );

            return solution.Id;
        }

        public async Task PostEmptySolutionWithRateAsync(long taskId, Solution solution)
        {
            var hasSolution = await _solutionsRepository
                .FindAll(s => s.TaskId == taskId && s.StudentId == solution.StudentId)
                .AnyAsync();

            if (hasSolution) throw new InvalidOperationException("У студента имеются решения");

            solution.PublicationDate = DateTime.UtcNow;
            solution.RatingDate = DateTime.UtcNow;
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

        public Task DeleteSolutionAsync(long solutionId)
        {
            return _solutionsRepository.DeleteAsync(solutionId);
        }

        public async Task MarkSolutionFinal(long solutionId)
        {
            await _solutionsRepository.UpdateSolutionState(solutionId, SolutionState.Final);
        }

        public async Task<SolutionPreviewDto[]> GetAllUnratedSolutions(long[] taskIds)
        {
            var getSolutionsQuery = _solutionsRepository.FindAll(t => taskIds.Contains(t.TaskId));

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

        public async Task<TaskSolutionsStats[]> GetTaskSolutionsStats(long[] taskIds)
        {
            var unratedSolutions = await GetAllUnratedSolutions(taskIds);
            var statsSolutions = unratedSolutions
                .GroupBy(s => s.TaskId)
                .Select(s => new TaskSolutionsStats
                {
                    TaskId = s.Key,
                    CountUnratedSolutions = s.Count()
                }).ToDictionary(t => t.TaskId);

            return taskIds.Select(t => statsSolutions.TryGetValue(t, out var value)
                ? value
                : new TaskSolutionsStats
                {
                    TaskId = t,
                    CountUnratedSolutions = 0
                }).ToArray();
        }

        public Task<Solution[]> GetTaskSolutionsFromGroupAsync(long taskId, long groupId)
        {
            return _solutionsRepository.FindAll(cm => cm.GroupId == groupId).ToArrayAsync();
        }
    }
}
