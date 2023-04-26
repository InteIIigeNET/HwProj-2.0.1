using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.CoursesService.DTO;
using HwProj.SolutionsService.API.Events;
using Microsoft.EntityFrameworkCore;
using static System.TimeSpan;

namespace HwProj.CoursesService.API.Services
{
    public class DeadlinesService : IDeadlinesService
    {
        private readonly IDeadlinesRepository _deadlinesRepository;
        private readonly IEventBus _eventBus;
        private readonly ITasksRepository _tasksRepository;
        private readonly ICoursesRepository _coursesRepository;

        public DeadlinesService(IEventBus eventBus, IDeadlinesRepository deadlinesRepository, ITasksRepository tasksRepository, ICoursesRepository coursesRepository)
        {
            _eventBus = eventBus;
            _deadlinesRepository = deadlinesRepository;
            _tasksRepository = tasksRepository;
            _coursesRepository = coursesRepository;
        }

        public async Task<long?> AddDeadlineAsync(long taskId, Deadline deadline)
        {
            var deadlineDateTimeInUtc = deadline.DateTime.Subtract(FromHours(3));
            var dateTimeInUtc = DateTime.UtcNow;
            deadline.TaskId = taskId;

            if (await _deadlinesRepository.CheckIfDeadlineExistsAsync(deadline))
                return null;
            
            var task = _tasksRepository.FindAll(task => task.Id == taskId).Include(task => task.Homework).First();

            var affectedStudents = _coursesRepository.FindAll(course => course.Id == task.Homework.CourseId)
                .Include(c => c.CourseMates)
                .First()
                .CourseMates
                .Where(mate => mate.IsAccepted && deadline.AffectedStudentsId.Contains(mate.StudentId))
                .Select(mate => mate.StudentId)
                .ToList();

            var jobId = new List<string>
            {
                BackgroundJob.Schedule(
                    () => ProcessByDay(taskId, deadline, affectedStudents),
                    deadlineDateTimeInUtc)
            };

            var daysToRemind = new[] {1, 3};
            
            foreach (var day in daysToRemind)
            {
                if (deadlineDateTimeInUtc - dateTimeInUtc > FromDays(day))
                {
                    jobId.Add(BackgroundJob.Schedule(
                        () => _eventBus.Publish(
                            new ClearCompletedEvent(taskId, affectedStudents, FromDays(day))),
                        deadlineDateTimeInUtc - FromDays(day))
                    );
                }
            }
            
            deadline.JobId = jobId;
            return await _deadlinesRepository.AddDeadlineAsync(deadline);
        }

        // Hangfire requires public methods to invoke
        public async Task ProcessByDay(long taskId, Deadline deadline, List<string> affectedStudents)
        {
            _eventBus.Publish(new ClearCompletedEvent(taskId, affectedStudents, Zero));
        }
        
        public async Task DeleteDeadline(long deadlineId)
        { 
            var deadline = await _deadlinesRepository.GetAsync(deadlineId);
            foreach (var jobId in deadline.JobId)
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
