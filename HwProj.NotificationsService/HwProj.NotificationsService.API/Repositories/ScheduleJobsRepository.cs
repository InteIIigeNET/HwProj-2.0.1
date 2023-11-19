using System.Linq;
using System.Threading.Tasks;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;
using HwProj.Repositories;
using Z.EntityFramework.Plus;

namespace HwProj.NotificationsService.API.Repositories
{
    public interface IScheduleJobsRepository : ICrudRepository<ScheduleJob, string>
    {
        public Task DeleteAllByCategoryAsync(string category, long categoryId);

        public IQueryable<ScheduleJob> GetAllByCategoryAsync(string category, long categoryId);
    }


    public class ScheduleJobsRepository : CrudRepository<ScheduleJob, string>, IScheduleJobsRepository
    {
        public ScheduleJobsRepository(NotificationsContext context) : base(context)
        {
        }

        public async Task DeleteAllByCategoryAsync(string category, long categoryId)
        {
            var predicate = (ScheduleJob scheduleJob) =>
            {
                var id = ScheduleJobIdHelper.ParseId(scheduleJob.Id);
                return id.CategoryId == categoryId && id.Category.Equals(category);
            };

            await Context.Set<ScheduleJob>()
                .Where(scheduleJob => predicate(scheduleJob))
                .DeleteAsync()
                .ConfigureAwait(true);
        }

        public IQueryable<ScheduleJob> GetAllByCategoryAsync(string category, long categoryId)
        {
            var predicate = (ScheduleJob scheduleJob) =>
            {
                var id = ScheduleJobIdHelper.ParseId(scheduleJob.Id);
                return id.CategoryId == categoryId && id.Category.Equals(category);
            };
            
            return FindAll(scheduleJob => predicate(scheduleJob));
        }
    }
}