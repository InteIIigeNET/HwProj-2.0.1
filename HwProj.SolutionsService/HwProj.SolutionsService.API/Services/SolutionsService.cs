using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.SolutionsService;
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

        public async Task<Solution> GetTaskSolutionsFromStudentAsync(long taskId, string studentId)
        {
            return await _solutionsRepository
                .FindAsync(solution => solution.TaskId == taskId && solution.StudentId == studentId);
        }

        public async Task<long> AddSolutionAsync(long taskId, Solution solution)
        {
            solution.TaskId = taskId;
            var id = await _solutionsRepository.AddAsync(solution);
            _eventBus.Publish(new RequestMaxRatingEvent(taskId, id));
            return id;
        }

        public async Task<long> PostOrUpdateAsync(long taskId, Solution solution)
        {
            var currentSolution = await GetTaskSolutionsFromStudentAsync(taskId, solution.StudentId);

            if (currentSolution == null)
            {
                solution.TaskId = taskId;
                var id = await _solutionsRepository.AddAsync(solution);
                _eventBus.Publish(new RequestMaxRatingEvent(taskId, id));
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
        
        public async Task RateSolutionAsync(long solutionId, int newRating)
        {
            var solution = await _solutionsRepository.GetAsync(solutionId);
            var state = solution.MaxRating == newRating ? SolutionState.Final : SolutionState.Rated;

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
