using HwProj.Repositories;

namespace HwProj.SolutionsService.API.Models.Repositories
{
    public class SolutionRepository : CrudRepository<Solution>, ISolutionRepository
    {
        public SolutionRepository(SolutionContext context)
            : base(context)
        {
        }
    }
}