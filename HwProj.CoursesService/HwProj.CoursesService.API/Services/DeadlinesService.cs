using System;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class DeadlinesService : IDeadlinesService
    {
        private readonly IDeadlinesRepository _deadlinesRepository;
        private readonly IEventBus _eventBus;
        private readonly ITasksRepository _tasksRepository;

        public DeadlinesService(IEventBus eventBus, IDeadlinesRepository deadlinesRepository, ITasksRepository tasksRepository)
        {
            _eventBus = eventBus;
            _deadlinesRepository = deadlinesRepository;
            _tasksRepository = tasksRepository;
        }

        public async Task<long> AddDeadlineAsync(long taskId, Deadline deadline)
        {
            var deadlineDateTimeInUtc = deadline.DateTime.Subtract(TimeSpan.FromHours(3));
            var dateTimeInUtc = DateTime.UtcNow;
            
            deadline.TaskId = taskId;
            var affectedStudents = _tasksRepository.FindAll(task => task.Id == taskId)
                .SelectMany(t => t.Homework.Course.CourseMates)
                .Where(mate => mate.IsAccepted)
                .Select(mate => mate.StudentId)
                .ToList();

            var jobId = BackgroundJob.Schedule(
                () => _eventBus.Publish(new ClearCompletedEvent(taskId, affectedStudents, TimeSpan.Zero)),
                deadlineDateTimeInUtc);
            if (deadlineDateTimeInUtc - dateTimeInUtc > TimeSpan.FromDays(1))
            {
                jobId += '\n' + BackgroundJob.Schedule(
                    () => _eventBus.Publish(
                        new ClearCompletedEvent(taskId, affectedStudents, TimeSpan.FromDays(1))),
                    deadlineDateTimeInUtc - TimeSpan.FromDays(1));
                if (deadlineDateTimeInUtc - dateTimeInUtc > TimeSpan.FromDays(3))
                {
                    jobId += '\n' + BackgroundJob.Schedule(
                        () => _eventBus.Publish(
                            new ClearCompletedEvent(taskId, affectedStudents, TimeSpan.FromDays(3))),
                        deadlineDateTimeInUtc - TimeSpan.FromDays(3));
                }
            }
            deadline.JobId = jobId;
            return await _deadlinesRepository.AddDeadlineAsync(deadline);
        }

        public async Task DeleteDeadline(long deadlineId)
        { 
            var deadline = await _deadlinesRepository.GetAsync(deadlineId);
            var jobsId = deadline.JobId.Split('\n');
            foreach (var jobId in jobsId)
            {
                BackgroundJob.Delete(jobId);
            }

            await _deadlinesRepository.DeleteAsync(deadlineId);
        }

        public async Task<Deadline[]> GetAllDeadlinesAsync()
        {
            return await _deadlinesRepository.GetAll().ToArrayAsync();
        }
    }
}
