using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.SolutionsService.API.Events;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.SolutionsService.API.Services
{
    public class SolutionsService : ISolutionsService
    {
        private readonly ISolutionsRepository _solutionsRepository;
        private readonly IEventBus _eventBus;
        public SolutionsService(ISolutionsRepository solutionsRepository, IEventBus eventBus)
        {
            _solutionsRepository = solutionsRepository;
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
            _eventBus.Publish(new RequestMaxRatingEvent(taskId, id));
            return id;
        }

        public async Task RateSolutionAsync(long solutionId, int newRating)
        {
            var solution = await _solutionsRepository.GetAsync(solutionId);
            SolutionState state;
            if (solution.MaxRating < newRating)
                state = SolutionState.Overrated;
            else if (solution.MaxRating == newRating)
                state = SolutionState.Final;
            else state = SolutionState.Rated;

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
