using System.Linq;
using System.Threading.Tasks;
using HwProj.EventBus.Client;
using HwProj.NotificationsService.API.Jobs;
using HwProj.NotificationsService.API.Models;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace HwProj.NotificationsService.API.Repositories
{
    public interface IScheduleJobsRepository
    {
        public Task AddAsync(ScheduleJob scheduleJob);
        public Task<ScheduleJob?> GetAsync(EventCategory category, string eventName, long itemId);
        public Task DeleteAsync(ScheduleJob[] jobs);
        public Task<ScheduleJob[]> FindAllInCategoryAsync(EventCategory category, long itemId);
    }


    public class ScheduleJobsRepository : IScheduleJobsRepository
    {
        private readonly NotificationsContext _context;

        public ScheduleJobsRepository(NotificationsContext context)
        {
            _context = context;
        }

        public async Task AddAsync(ScheduleJob scheduleJob)
        {
            await _context.AddAsync(scheduleJob);
            await _context.SaveChangesAsync();
        }

        public async Task<ScheduleJob?> GetAsync(EventCategory category, string eventName, long itemId)
        {
            return await _context.Set<ScheduleJob>().FindAsync(category, eventName, itemId);
        }

        public async Task DeleteAsync(Event @event, long itemId)
        {
            await _context.Set<ScheduleJob>()
                .Where(scheduleJob =>
                    scheduleJob.Category == @event.Category &&
                    scheduleJob.EventName == @event.EventName &&
                    scheduleJob.ItemId == itemId)
                .DeleteAsync();
        }

        public async Task DeleteAsync(ScheduleJob[] jobs)
        {
            _context.Set<ScheduleJob>().RemoveRange(jobs);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAllInCategoryByItemIdAsync(Event @event, long itemId)
        {
            await _context.Set<ScheduleJob>()
                .Where(scheduleJob => scheduleJob.Category == @event.Category && scheduleJob.ItemId == itemId)
                .DeleteAsync();
        }

        public async Task<ScheduleJob[]> FindAllInCategoryAsync(EventCategory category, long itemId)
        {
            return await _context.Set<ScheduleJob>()
                .Where(scheduleJob => scheduleJob.Category == category && scheduleJob.ItemId == itemId)
                .AsNoTracking()
                .ToArrayAsync();
        }
    }
}
