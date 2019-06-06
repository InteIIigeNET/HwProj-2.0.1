using System.Threading.Tasks;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Services
{
    public interface ISolutionsService
    {
        Solution[] GetAllSolutions();

        Task<Solution> GetSolutionAsync(long solutionId);

        Solution[] GetTaskSolutionsFromStudent(long taskId, string studentId);

        Task<long> AddSolutionAsync(long taskId, Solution solution);

        Task AcceptSolutionAsync(long solutionId);

        Task RejectSolutionAsync(long solutionId);

        Task DeleteSolutionAsync(long solutionId);
    }
}