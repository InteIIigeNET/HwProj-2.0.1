using System.Threading.Tasks;
using HwProj.Repositories.Net8;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Repositories
{
    public interface IGithubSolutionCommitsRepository : ICrudRepository<GithubSolutionCommit, long>
    {
        Task<GithubSolutionCommit?> TryGetLastBySolutionId(long solutionId);
    }
}