using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Repositories
{
    public class DeadlineRepository : CrudRepository<Deadline, long>, IDeadlineRepository
    {
        public DeadlineRepository(CourseWorkContext context) 
            : base(context)
        {
        }

        public async Task<Deadline> GetDeadlineAsync(long id)
        {
            return await Context.Set<Deadline>()
                .Include(d => d.CourseWork)
                .FirstOrDefaultAsync(d => d.Id == id);
        }
    }
}
