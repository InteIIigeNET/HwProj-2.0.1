using System.Threading.Tasks;
using HwProj.Repositories;

namespace HwProj.SolutionsService.API.Models.Repositories
{
    public class SolutionRepository : CrudRepository<Solution>, ISolutionRepository
    {
        public SolutionRepository(SolutionContext context)
            : base(context)
        {
        }

        public Task UpdateSolutionStateAsync(long solutionId, SolutionState newState)
            => UpdateAsync(solutionId, solution => new Solution() {State = newState});
    }
}