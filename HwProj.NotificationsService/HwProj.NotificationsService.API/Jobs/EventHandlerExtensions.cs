using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Hangfire;
using HwProj.EventBus.Client;
using HwProj.NotificationsService.API.Repositories;
using Microsoft.Azure.KeyVault.Models;

namespace HwProj.NotificationsService.API.Jobs
{
    public static class EventHandlerExtensions<TEvent> where TEvent : Event
    {
        public static async Task AddScheduleJobAsync(TEvent @event, long itemId, DateTime publicationDate,
            Expression<Func<Task>> jobFunc, IScheduleJobsRepository jobsRepository)
        {
            var jobId = BackgroundJob.Schedule(jobFunc, publicationDate);

            if (jobId == null)
                throw new InvalidOperationException($"Невозможно создать отложенное событие для {@event.EventName}");
            
            var scheduleJob = new ScheduleJob(@event, itemId, jobId);
            await jobsRepository.AddAsync(scheduleJob);
            BackgroundJob.ContinueJobWith(
                jobId,
                () => jobsRepository.DeleteAsync(new[] { scheduleJob }),
                JobContinuationOptions.OnAnyFinishedState
            );
        }

        public static async Task UpdateScheduleJobAsync(TEvent @event, long itemId, DateTime publicationDate,
            Expression<Func<Task>> jobFunc, IScheduleJobsRepository jobsRepository)
        {
            var scheduleJob = await jobsRepository.GetAsync(@event.Category, @event.EventName, itemId);
            if (scheduleJob == null) return;
            
            BackgroundJob.Reschedule(scheduleJob.JobId, publicationDate);
        }

        public static async Task DeleteScheduleJobsAsync(TEvent @event, long itemId,
            IScheduleJobsRepository jobsRepository)
        {
            var scheduleJobs = await jobsRepository.FindAllInCategoryAsync(@event.Category, itemId);

            foreach (var scheduleJob in scheduleJobs)
            {
                BackgroundJob.Delete(scheduleJob.JobId);
            }
        }
    }
}
