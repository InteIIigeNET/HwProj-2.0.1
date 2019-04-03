using System.Threading.Tasks;
using HwProj.Repositories;

namespace HwProj.SolutionsService.API.Models.Repositories
{
    public interface ISolutionRepository : ICrudRepository<Solution>
    {
        Task UpdateSolutionStateAsync(long solutionId, SolutionState newState);
    }
}