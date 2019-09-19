using System.Threading.Tasks;
using HwProj.HomeworkService.API.Models;

namespace HwProj.HomeworkService.API.Services
{
    public interface ITasksService
    {
        Task<HomeworkTask[]> GetAllTasksAsync();
        Task<HomeworkTask> GetTaskAsync(long taskId);
        Task<long> AddTaskAsync(long homeworkId, HomeworkTask task);
        Task DeleteTaskAsync(long taskId);
        Task UpdateTaskAsync(long taskId, HomeworkTask update);
    }
}