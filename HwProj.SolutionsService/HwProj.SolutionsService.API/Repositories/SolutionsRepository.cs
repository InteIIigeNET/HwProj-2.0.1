using System.Threading.Tasks;
using HwProj.Repositories;
using HwProj.SolutionsService.API.Models;

namespace HwProj.SolutionsService.API.Repositories
{
    public class SolutionsRepository : CrudRepository<Solution, long>, ISolutionsRepository
    {
        public SolutionsRepository(SolutionContext context)
            : base(context)
        {
        }

        public async Task UpdateSolutionStateAsync(long solutionId, SolutionState newState)
        {
            await UpdateAsync(solutionId, solution => new Solution {State = newState});
        }
    }
}