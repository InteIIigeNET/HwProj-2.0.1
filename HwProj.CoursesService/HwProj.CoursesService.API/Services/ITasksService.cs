using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models;

namespace HwProj.CoursesService.API.Services
{
    public interface ITasksService
    {
        Task<HomeworkTask> GetTaskAsync(long taskId);
        Task<HomeworkTask> GetForEditingTaskAsync(long taskId);
        Task<HomeworkTask> AddTaskAsync(long homeworkId, HomeworkTask task);
        Task DeleteTaskAsync(long taskId);
        Task<HomeworkTask> UpdateTaskAsync(long taskId, HomeworkTask update, ActionOptions options);
    }
}
