using System.Linq;
using System.Threading.Tasks;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Repositories;

namespace HwProj.HomeworkService.API.Services
{
    public class TasksService : ITasksService
    {
        private readonly ITasksRepository _tasksRepository;

        public TasksService(ITasksRepository tasksRepository)
        {
            _tasksRepository = tasksRepository;
        }

        public HomeworkTask[] GetAllTasks()
        {
            return _tasksRepository.GetAll().ToArray();
        }

        public Task<HomeworkTask> GetTaskAsync(long taskId)
        {
            return _tasksRepository.GetAsync(taskId);
        }

        public Task<long> AddTaskAsync(long homeworkId, HomeworkTask task)
        {
            task.HomeworkId = homeworkId;
            return _tasksRepository.AddAsync(task);
        }

        public Task DeleteTaskAsync(long taskId)
        {
            return _tasksRepository.DeleteAsync(taskId);
        }

        public Task UpdateTaskAsync(long taskId, HomeworkTask update)
        {
            return _tasksRepository.UpdateAsync(taskId, task => update);
        }
    }
}