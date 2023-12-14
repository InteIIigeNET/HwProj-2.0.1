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
        public static async Task AddScheduleJobAsync(TEvent @event, long categoryId, DateTime publicationDate,
            Expression<Func<Task>> jobFunc, IScheduleJobsRepository jobsRepository)
        {
            var id = ScheduleJobIdHelper.BuildId(@event, categoryId);
            var jobId = BackgroundJob.Schedule(jobFunc, publicationDate.Subtract(TimeSpan.FromHours(3)));
            var scheduleJob = new ScheduleJob(id, jobId);
            
            await jobsRepository.AddAsync(scheduleJob);
        }

        
        public static async Task DeleteScheduleJobsAsync(TEvent @event, long categoryId, IScheduleJobsRepository jobsRepository)
        {
            var category = ScheduleJobIdHelper.GetCategory(@event);
            var scheduleJobs = jobsRepository.GetAllByCategoryAsync(category, categoryId);
            foreach (var scheduleJob in scheduleJobs)
            {
                BackgroundJob.Delete(scheduleJob.JobId);
            }

            await jobsRepository.DeleteAllByCategoryAsync(category, categoryId);
        }

        
        public static async Task UpdateScheduleJobAsync(TEvent @event, long categoryId, DateTime publicationDate,
            Expression<Func<Task>> jobFunc, IScheduleJobsRepository jobsRepository)
        {
            await DeleteScheduleJobsAsync(@event, categoryId, jobsRepository);
            
            var id = ScheduleJobIdHelper.BuildId(@event, categoryId); 
            var jobId = BackgroundJob.Schedule(jobFunc, publicationDate.Subtract(TimeSpan.FromHours(3)));
            var scheduleJob = new ScheduleJob(id, jobId);

            await jobsRepository.AddAsync(scheduleJob);
        }
        
        
        public static async Task DeleteScheduleJobAsync(TEvent @event, long categoryId, IScheduleJobsRepository jobsRepository)
        {
            var id = ScheduleJobIdHelper.BuildId(@event, categoryId);
            var scheduleJob = await jobsRepository.GetAsync(id.ToString());

            BackgroundJob.Delete(scheduleJob.JobId);

            await jobsRepository.DeleteAsync(id.ToString());
        }

    }
}