using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Services
{
    public interface ITasksService
    {
        Task<HomeworkTask> GetTaskAsync(long taskId);
        Task<long> AddTaskAsync(long homeworkId, HomeworkTask task);
        Task DeleteTaskAsync(long taskId);
        Task UpdateTaskAsync(long taskId, HomeworkTask update);
    }
}
