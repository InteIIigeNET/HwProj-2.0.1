using System.Linq;
using System.Threading.Tasks;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.HomeworkService.API.Services
{
    public class TasksService : ITasksService
    {
        private readonly ITasksRepository _tasksRepository;

        public TasksService(ITasksRepository tasksRepository)
        {
            _tasksRepository = tasksRepository;
        }

        public async Task<HomeworkTask[]> GetAllTasksAsync()
        {
            return await _tasksRepository.GetAll().ToArrayAsync();
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
                Description = update.Description
            });
        }
    }
}