using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class CriterionsRepository : CrudRepository<Criterions, long>, ICriterionsRepository
    {
        public CriterionsRepository(CourseContext context)
            : base(context)
        {
        }

        public async Task<List<Criterions>> GetByTaskIdAsync(long taskId)
        {
            return await Context.Set<Criterions>()
                .AsNoTracking()
                .Where(c => c.TaskId == taskId)
                .ToListAsync();
        }

        public Task<Criterions?> GetCriterions(long id)
        {
            return Context.Set<Criterions>()
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}
