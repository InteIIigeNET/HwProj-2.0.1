using System.Threading.Tasks;
using HwProj.Models.SolutionsService;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Services
{
    public interface ISolutionsService
    {
        Task<Solution[]> GetAllSolutionsAsync();

        Task<Solution> GetSolutionAsync(long solutionId);

        Task<Solution[]> GetTaskSolutionsFromStudentAsync(long taskId, string studentId);

        Task<Solution[]> GetTaskSolutionsFromGroupAsync(long taskId, long groupId);
        
        Task<long> PostOrUpdateAsync(long taskId, Solution solution);

        Task RateSolutionAsync(long solutionId, int newRating, string lecturerComment);

        Task DeleteSolutionAsync(long solutionId);
        
        Task MarkSolutionFinal(long solutionId);
    }
}
