using System.Threading.Tasks;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Services
{
    public interface ISolutionsService
    {
        Task<Solution[]> GetAllSolutionsAsync();

        Task<Solution> GetSolutionAsync(long solutionId);

        Task<Solution[]> GetTaskSolutionsFromStudentAsync(long taskId, string studentId);

        Task<long> AddSolutionAsync(long taskId, Solution solution);

        Task AcceptSolutionAsync(long solutionId);

        Task RejectSolutionAsync(long solutionId);

        Task DeleteSolutionAsync(long solutionId);
    }
}