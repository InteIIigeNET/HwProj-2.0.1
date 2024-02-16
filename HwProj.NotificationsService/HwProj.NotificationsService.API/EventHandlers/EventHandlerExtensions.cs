using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Hangfire;
using HwProj.EventBus.Client;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public static class EventHandlerExtensions<TEvent> where TEvent : Event
    {
        public static async Task AddScheduleJobAsync(TEvent @event, long itemId, DateTime publicationDate,
            Expression<Func<Task>> jobFunc, IScheduleJobsRepository jobsRepository)
        {
            var jobId = BackgroundJob.Schedule(jobFunc, publicationDate);
            var scheduleJob = new ScheduleJob(@event, itemId, jobId);

            BackgroundJob.ContinueJobWith(jobId, () => jobsRepository.DeleteAsync(@event, itemId), JobContinuationOptions.OnAnyFinishedState);

            await jobsRepository.AddAsync(scheduleJob);
        }


        public static async Task UpdateScheduleJobAsync(TEvent @event, long itemId, DateTime publicationDate,
            Expression<Func<Task>> jobFunc, IScheduleJobsRepository jobsRepository)
        {
            await DeleteScheduleJobsAsync(@event, itemId, jobsRepository);
            await AddScheduleJobAsync(@event, itemId, publicationDate, jobFunc, jobsRepository);
        }

        
        public static async Task DeleteScheduleJobsAsync(TEvent @event, long itemId,
            IScheduleJobsRepository jobsRepository)
        {
            var category = ScheduleJobIdHelper.GetCategory(@event);
            var scheduleJobs = jobsRepository.FindAll(scheduleJob =>
                scheduleJob.Category.Equals(category) && scheduleJob.ItemId == itemId);
            
            foreach (var scheduleJob in scheduleJobs)
            {
                BackgroundJob.Delete(scheduleJob.JobId);
            }

            await jobsRepository.DeleteAllInCategoryByItemIdAsync(@event, itemId);
        }
    }
}