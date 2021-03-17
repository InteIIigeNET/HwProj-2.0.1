using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Repositories.Implementations
{
    public class DirectionRepository : CrudRepository<Direction, long>, IDirectionRepository
    {
        public DirectionRepository(CourseWorkContext context) : base(context)
        {

        }

        public async Task<Direction[]> GetDirectionsAsync()
        {
            return await Context.Set<Direction>()
                .Include(d => d.CuratorProfile)
                .ThenInclude(cp => cp.User)
                .ToArrayAsync();
        }
    }
}
