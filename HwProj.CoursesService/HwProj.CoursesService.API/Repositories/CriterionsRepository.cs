using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class CriterionsRepository : CrudRepository<Criterion, long>, ICriterionsRepository
    {
        public CriterionsRepository(CourseContext context)
            : base(context)
        {
        }

        public async Task<List<Criterion>> GetByTaskIdAsync(long taskId)
        {
            return await Context.Set<Criterion>()
                .AsNoTracking()
                .Where(c => c.TaskId == taskId)
                .ToListAsync();
        }

    }
}
