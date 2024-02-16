using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.EventBus.Client;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace HwProj.NotificationsService.API.Repositories
{
    public interface IScheduleJobsRepository
    {
        public Task AddAsync(ScheduleJob scheduleJob);

        public Task DeleteAsync(Event @event, long itemId);

        public Task DeleteAllInCategoryByItemIdAsync(Event @event, long itemId);

        public IEnumerable<ScheduleJob> FindAll(Expression<Func<ScheduleJob, bool>> predicate);
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
            await _context.AddAsync(scheduleJob).ConfigureAwait(false);
            await _context.SaveChangesAsync().ConfigureAwait(false);
        }

        public async Task DeleteAsync(Event @event, long itemId)
        {
            var category = ScheduleJobIdHelper.GetCategory(@event);
            var eventName = ScheduleJobIdHelper.GetEventName(@event);
            
            await _context.Set<ScheduleJob>()
                .Where(scheduleJob =>
                    scheduleJob.Category.Equals(category) && scheduleJob.EventName.Equals(eventName) &&
                    scheduleJob.ItemId == itemId)
                .DeleteAsync()
                .ConfigureAwait(false);
        }

        public async Task DeleteAllInCategoryByItemIdAsync(Event @event, long itemId)
        {
            var category = ScheduleJobIdHelper.GetCategory(@event);
            
            await _context.Set<ScheduleJob>()
                .Where(scheduleJob => scheduleJob.Category.Equals(category)  && scheduleJob.ItemId == itemId)
                .DeleteAsync()
                .ConfigureAwait(true);
        }

        public IEnumerable<ScheduleJob> FindAll(Expression<Func<ScheduleJob, bool>> predicate)
        {
            return _context.Set<ScheduleJob>().AsNoTracking().Where(predicate);
        }
    }
}