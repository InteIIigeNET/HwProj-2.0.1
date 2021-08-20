using System.Threading.Tasks;
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Services
{
    public class TasksService : ITasksService
    {
        private readonly ITasksRepository _tasksRepository;
        private readonly IEventBus _eventBus;

        public TasksService(ITasksRepository tasksRepository, IEventBus eventBus)
        {
            _tasksRepository = tasksRepository;
            _eventBus = eventBus;
        }
        
        public async Task<HomeworkTask> GetTaskAsync(long taskId)
        {
            return await _tasksRepository.GetAsync(taskId);
        }

        public async Task<long> AddTaskAsync(long homeworkId, HomeworkTask task)
        {
            task.HomeworkId = homeworkId;
            return await _tasksRepository.AddAsync(task);
        }

        public async Task DeleteTaskAsync(long taskId)
        {
            await _tasksRepository.DeleteAsync(taskId);
        }

        public async Task UpdateTaskAsync(long taskId, HomeworkTask update)
        {
            await _tasksRepository.UpdateAsync(taskId, task => new HomeworkTask()
            {
                Title = update.Title,
                Description = update.Description,
                MaxRating = update.MaxRating,
                DeadlineDate = update.DeadlineDate,
                PublicationDate = update.PublicationDate
            });
            _eventBus.Publish(new UpdateTaskMaxRatingEvent(taskId, update.MaxRating));
        }
    }
}
