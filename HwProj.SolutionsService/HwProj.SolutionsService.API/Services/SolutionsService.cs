using System.Threading.Tasks;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.SolutionsService.API.Services
{
    public class SolutionsService : ISolutionsService
    {
        private readonly ISolutionsRepository _solutionsRepository;

        public SolutionsService(ISolutionsRepository solutionsRepository)
        {
            _solutionsRepository = solutionsRepository;
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

        public Task<long> AddSolutionAsync(long taskId, Solution solution)
        {
            solution.TaskId = taskId;
            return _solutionsRepository.AddAsync(solution);
        }

        public Task AcceptSolutionAsync(long solutionId)
        {
            return _solutionsRepository.UpdateSolutionStateAsync(solutionId, SolutionState.Accepted);
        }

        public Task RejectSolutionAsync(long solutionId)
        {
            return _solutionsRepository.UpdateSolutionStateAsync(solutionId, SolutionState.Rejected);
        }

        public Task DeleteSolutionAsync(long solutionId)
        {
            return _solutionsRepository.DeleteAsync(solutionId);
        }
    }
}