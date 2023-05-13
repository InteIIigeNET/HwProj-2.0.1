using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.SolutionsService;
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
            return await _solutionsRepository
                .FindAll(solution => solution.TaskId == taskId && solution.StudentId == studentId)
                .OrderBy(t => t.PublicationDate)
                .ToArrayAsync();
        }

        public async Task<Solution?[]> GetLastTaskSolutions(long[] taskIds, string studentId)
        {
            var solutions = await _solutionsRepository
                .FindAll(s => s.StudentId == studentId && taskIds.Contains(s.TaskId))
                .GroupBy(t => t.TaskId)
                .Select(t => t.OrderByDescending(s => s.PublicationDate).FirstOrDefault())
                .ToArrayAsync();

            return taskIds.Select(t => solutions.FirstOrDefault(s => s?.TaskId == t)).ToArray();
        }

        public async Task<long> PostOrUpdateAsync(long taskId, Solution solution)
        {
            solution.PublicationDate = DateTimeUtils.GetMoscowNow();
            var allSolutionsForTask = await GetTaskSolutionsFromStudentAsync(taskId, solution.StudentId);
            var currentSolution = allSolutionsForTask.FirstOrDefault(s => s.Id == solution.Id);
            var solutionModel = _mapper.Map<SolutionViewModel>(solution);
            var task = await _coursesServiceClient.GetTask(solution.TaskId);
            var taskModel = _mapper.Map<HomeworkTaskViewModel>(task);
            var homework = await _coursesServiceClient.GetHomework(task.HomeworkId);
            var courses = await _coursesServiceClient.GetCourseById(homework.CourseId);
            var student = await _authServiceClient.GetAccountData(solutionModel.StudentId);
            var studentModel = _mapper.Map<AccountDataDto>(student);
            _eventBus.Publish(new StudentPassTaskEvent(courses, solutionModel, studentModel, taskModel));

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

            solution.PublicationDate = DateTimeUtils.GetMoscowNow();
            solution.TaskId = taskId;
            solution.Comment = "[Решение было сдано вне сервиса]";
            var id = await _solutionsRepository.AddAsync(solution);
            await RateSolutionAsync(id, solution.Rating, solution.LecturerComment);
        }

        public async Task RateSolutionAsync(long solutionId, int newRating, string lecturerComment)
        {
            var solution = await _solutionsRepository.GetAsync(solutionId);
            var task = await _coursesServiceClient.GetTask(solution.TaskId);
            if (0 <= newRating && newRating <= task.MaxRating)
            {
                var solutionModel = _mapper.Map<SolutionViewModel>(solution);
                var taskModel = _mapper.Map<HomeworkTaskViewModel>(task);
                _eventBus.Publish(new RateEvent(taskModel, solutionModel));
                var state = newRating >= task.MaxRating ? SolutionState.Final : SolutionState.Rated;
                await _solutionsRepository.RateSolutionAsync(solutionId, state, newRating, lecturerComment);
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

        public Task<Solution[]> GetTaskSolutionsFromGroupAsync(long taskId, long groupId)
        {
            return _solutionsRepository.FindAll(cm => cm.GroupId == groupId).ToArrayAsync();
        }
    }
}
