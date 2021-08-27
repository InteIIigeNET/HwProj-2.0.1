using System;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client.Interfaces;
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
        public SolutionsService(ISolutionsRepository solutionsRepository, IEventBus eventBus, IMapper mapper, ICoursesServiceClient coursesServiceClient)
        {
            _solutionsRepository = solutionsRepository;
            _eventBus = eventBus;
            _mapper = mapper;
            _coursesServiceClient = coursesServiceClient;
        }

        public async Task<Solution[]> GetAllSolutionsAsync()
        {
            return await _solutionsRepository.GetAll().ToArrayAsync();
        }

        public Task<Solution> GetSolutionAsync(long solutionId)
        {
            return _solutionsRepository.GetAsync(solutionId);
        }

        public async Task<Solution> GetTaskSolutionsFromStudentAsync(long taskId, string studentId)
        {
            return await _solutionsRepository
                .FindAsync(solution => solution.TaskId == taskId && solution.StudentId == studentId);
        }
        
        
        public async Task<long> PostOrUpdateAsync(long taskId, Solution solution)
        {
            var currentSolution = await GetTaskSolutionsFromStudentAsync(taskId, solution.StudentId);
            
            if (currentSolution == null)
            {
                solution.TaskId = taskId;
                var id = await _solutionsRepository.AddAsync(solution);
                return id;
            }
    
            await _solutionsRepository.UpdateAsync(currentSolution.Id, s => new Solution()
                {
                    State = SolutionState.Reposted,
                    Comment = solution.Comment,
                    GithubUrl = solution.GithubUrl
                }
            );

            return solution.Id;
        }

        public async Task<long> AddSolutionAsync(long taskId, Solution solution)
        {
            solution.TaskId = taskId;
            var id = await _solutionsRepository.AddAsync(solution);

            var solutionModel = _mapper.Map<SolutionViewModel>(solution);
            var task = await _coursesServiceClient.GetTask(solution.TaskId);
            var taskModel = _mapper.Map<HomeworkTaskViewModel>(task);
            var homework = await _coursesServiceClient.GetHomework(taskModel.HomeworkId);
            var homeworkModel = _mapper.Map<HomeworkViewModel>(homework);
            var courses = await _coursesServiceClient.GetCourseById(homeworkModel.CourseId, solution.StudentId);
            _eventBus.Publish(new StudentPassTaskEvent(courses, solutionModel));

            return id;
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
                SolutionState state = newRating >= task.MaxRating ? SolutionState.Final : SolutionState.Rated;
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
