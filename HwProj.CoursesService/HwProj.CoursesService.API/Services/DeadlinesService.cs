using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.EntityFrameworkCore;
using static System.TimeSpan;

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

        public async Task<long?> AddDeadlineAsync(long taskId, Deadline deadline)
        {
            var deadlineDateTimeInUtc = deadline.DateTime.Subtract(FromHours(3));
            var dateTimeInUtc = DateTime.UtcNow;
            deadline.TaskId = taskId;

            if (await _deadlinesRepository.CheckIfDeadlineExistsAsync(deadline))
                return null;
            
            var affectedStudents = _tasksRepository.FindAll(task => task.Id == taskId)
                .SelectMany(t => t.Homework.Course.CourseMates)
                .Where(mate => mate.IsAccepted)
                .Select(mate => mate.StudentId)
                .ToList();

            var jobId = BackgroundJob.Schedule(
                () => ProcessByDay(taskId, deadline, affectedStudents),
                deadlineDateTimeInUtc);

            var daysToRemind = new[] {1, 3};
            
            foreach (var day in daysToRemind)
            {
                if (deadlineDateTimeInUtc - dateTimeInUtc > FromDays(day))
                {
                    jobId += '\n' + BackgroundJob.Schedule(
                        () => _eventBus.Publish(
                            new ClearCompletedEvent(taskId, affectedStudents, FromDays(day))),
                        deadlineDateTimeInUtc - FromDays(day));
                }
            }
            
            deadline.JobId = jobId;
            return await _deadlinesRepository.AddDeadlineAsync(deadline);
        }

        // Hangfire requires public methods to invoke
        public async Task ProcessByDay(long taskId, Deadline deadline, List<string> affectedStudents)
        {
            _eventBus.Publish(new ClearCompletedEvent(taskId, affectedStudents, Zero));
            await _tasksRepository.ProcessDeadlineAsync(taskId, deadline);
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
        
        public async Task<Deadline[]> GetTaskDeadlinesAsync(long taskId)
        {
            return await _deadlinesRepository.FindAll(d => d.TaskId == taskId).ToArrayAsync()
                .ConfigureAwait(false);
        }
    }
}
