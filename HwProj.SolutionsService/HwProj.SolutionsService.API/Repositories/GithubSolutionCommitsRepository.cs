using System.Threading.Tasks;
using HwProj.Repositories;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Repositories
{
    public class GithubSolutionCommitsRepository :
        CrudRepository<GithubSolutionCommit, long>,
        IGithubSolutionCommitsRepository
    {
        public GithubSolutionCommitsRepository(SolutionContext context)
            : base(context)
        {
        }

        public async Task<GithubSolutionCommit?> TryGetLastBySolutionId(long solutionId)
        {
            var result = await FindAsync(c => c.Id == solutionId);
            return result;
        }
    }
}
