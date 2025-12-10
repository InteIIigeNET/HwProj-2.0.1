using HwProj.CoursesService.API.Models;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Services
{
    public interface ITasksService
    {
        Task<HomeworkTask> GetTaskAsync(long taskId);
        Task<HomeworkTaskViewModel> GetTaskWithCriteriasAsync(long taskId,bool withCriterias);
        Task<HomeworkTask> GetForEditingTaskAsync(long taskId);
        Task<HomeworkTaskForEditingViewModel> GetForEditingTaskWithCriteriasAsync(long taskId);
        Task<HomeworkTask> AddTaskAsync(long homeworkId, CreateTaskViewModel taskViewModel);
        Task DeleteTaskAsync(long taskId);
        Task<HomeworkTask> UpdateTaskAsync(long taskId, CreateTaskViewModel taskViewModel, ActionOptions options);
    }
}
