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
                .Include(cw => cw.CuratorProfile)
					.ThenInclude(cp => cp.ReviewersInCuratorsBidding)
                .Include(cw => cw.Bids)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task ClearIsUpdatedInCourseWorksByCuratorAsync(string userId)
        {
	        var courseWorks = await Context.Set<CourseWork>()
		        .Where(cw => cw.CuratorProfileId == userId)
		        .ToArrayAsync()
		        .ConfigureAwait(false);

	        foreach (var courseWork in courseWorks)
	        {
		        courseWork.IsUpdated = false;
	        }

	        await Context.SaveChangesAsync().ConfigureAwait(false);
        }

        public async Task AddBidInCourseWork(long courseWorkId, string reviewerId, BiddingValues value)
        {
	        var courseWork = await Context.Set<CourseWork>()
		        .Include(cw => cw.Bids)
		        .FirstOrDefaultAsync(cw => cw.Id == courseWorkId)
		        .ConfigureAwait(false);

	        var bid = courseWork.Bids.FirstOrDefault(b => b.ReviewerProfileId == reviewerId);
	        if (bid != null)
	        {
		        bid.BiddingValue = value;
	        }
	        else
	        {
				courseWork.Bids.Add(new Bid
				{
					ReviewerProfileId = reviewerId,
					CourseWorkId = courseWorkId,
					BiddingValue = value
				});
	        }

	        await Context.SaveChangesAsync().ConfigureAwait(false);
        }
    }
}
