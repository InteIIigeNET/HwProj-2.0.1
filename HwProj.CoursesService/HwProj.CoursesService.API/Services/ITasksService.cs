using HwProj.CoursesService.API.Models;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Services
{
    public interface ITasksService
    {
        Task<HomeworkTaskViewModel> GetTaskAsync(long taskId, bool withCriterias = false);
        Task<HomeworkTask> GetForEditingTaskAsync(long taskId);
        Task<HomeworkTaskForEditingViewModel> GetForEditingTaskWithCriteriasAsync(long taskId);
        Task<HomeworkTask> AddTaskAsync(long homeworkId, CreateTaskViewModel taskViewModel);
        Task DeleteTaskAsync(long taskId);
        Task<HomeworkTask> UpdateTaskAsync(long taskId, CreateTaskViewModel taskViewModel, ActionOptions options);
    }
}
