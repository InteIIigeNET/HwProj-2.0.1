using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Services
{
    public interface ITasksService
    {
        Task<HomeworkTask> GetTaskAsync(long taskId, bool withCriteria = false);
        Task<HomeworkTask> GetForEditingTaskAsync(long taskId);
        Task<HomeworkTask> AddTaskAsync(long homeworkId, PostTaskViewModel taskViewModel);
        Task DeleteTaskAsync(long taskId);
        Task<HomeworkTask> UpdateTaskAsync(long taskId, PostTaskViewModel taskViewModel, ActionOptions options);
        Task<string?> GetTaskLtiUrlAsync(long taskId);
        Task<Dictionary<long, string>> GetLtiUrlsForTasksAsync(long[] taskIds);
    }
}
