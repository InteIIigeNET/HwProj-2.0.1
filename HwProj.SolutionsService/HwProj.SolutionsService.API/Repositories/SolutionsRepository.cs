using System.Threading.Tasks;
using HwProj.Repositories;
using HwProj.SolutionsService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HwProj.SolutionsService.API.Repositories
{
    public class SolutionsRepository : CrudRepository<Solution>, ISolutionsRepository
    {
        public SolutionsRepository(SolutionContext context)
            : base(context)
        {
        }

        public Task UpdateSolutionStateAsync(long solutionId, SolutionState newState)
            => UpdateAsync(solutionId, solution => new Solution() {State = newState});
    }
}