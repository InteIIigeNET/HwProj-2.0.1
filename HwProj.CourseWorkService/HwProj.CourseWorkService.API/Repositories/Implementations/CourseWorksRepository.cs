using System.Linq;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Repositories.Implementations
{
    public class CourseWorksRepository : CrudRepository<CourseWork, long>, ICourseWorksRepository
    {
        public CourseWorksRepository(CourseWorkContext context)
           : base(context)
        {
        }

        public async Task<CourseWork> GetCourseWorkAsync(long id)
        {
            return await Context.Set<CourseWork>().Include(c => c.Applications)
                .Include(c => c.Deadlines)
					.ThenInclude(d => d.DeadlineType)
                .Include(c => c.WorkFiles)
					.ThenInclude(wf => wf.FileType)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task ClearIsUpdatedInCourseWorksByCuratorAsync(string userId)
        {
	        var courseWorks = await Context.Set<CourseWork>()
		        .Where(cw => cw.CuratorId == userId)
		        .ToArrayAsync()
		        .ConfigureAwait(false);

	        foreach (var courseWork in courseWorks)
	        {
		        courseWork.IsUpdated = false;
	        }

	        await Context.SaveChangesAsync().ConfigureAwait(false);
        }
    }
}
