using System.Threading.Tasks;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.SolutionsService.API.Services
{
    public class SolutionsService : ISolutionsService
    {
        private readonly ISolutionsRepository _solutionsRepository;
        private readonly IEventBus _eventBus;
        private readonly ICoursesServiceClient _coursesServiceClient;
        public SolutionsService(ISolutionsRepository solutionsRepository, ICoursesServiceClient coursesServiceClient, IEventBus eventBus)
        {
            _solutionsRepository = solutionsRepository;
            _coursesServiceClient = coursesServiceClient;
            _eventBus = eventBus;
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
                .ToArrayAsync();
        }

        public async Task<long> AddSolutionAsync(long taskId, Solution solution)
        {
            solution.TaskId = taskId;
            var id = await _solutionsRepository.AddAsync(solution);
            return id;
        }

        public async Task RateSolutionAsync(long solutionId, int newRating)
        {
            var solution = await _solutionsRepository.GetAsync(solutionId);
            var task = await _coursesServiceClient.GetTask(solution.TaskId);
            SolutionState state = newRating >= task.MaxRating ? SolutionState.Final : SolutionState.Rated;
            await _solutionsRepository.RateSolutionAsync(solutionId, state, newRating);
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
