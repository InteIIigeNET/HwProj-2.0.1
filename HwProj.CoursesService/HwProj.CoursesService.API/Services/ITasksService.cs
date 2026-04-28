using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Services
{
    public interface ITasksService
    {
        Task<HomeworkTaskViewModel> GetTaskAsync(long taskId, bool withCriteria = false);
        Task<HomeworkTask> GetForEditingTaskAsync(long taskId);
        Task<HomeworkTaskViewModel> AddTaskAsync(long homeworkId, PostTaskViewModel taskViewModel);
        Task DeleteTaskAsync(long taskId);
        Task<HomeworkTaskViewModel> UpdateTaskAsync(long taskId, PostTaskViewModel taskViewModel, ActionOptions options);
        Task FillLtiLaunchDataForTasks(HomeworkViewModel viewModel);
    }
}
