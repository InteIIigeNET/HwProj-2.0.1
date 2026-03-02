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
        Task<LtiLaunchData?> GetTaskLtiDataAsync(long taskId);
        Task<Dictionary<long, LtiLaunchData>> GetLtiDataForTasksAsync(long[] taskIds);
        Task<HomeworkTask> AddTaskAsync(long homeworkId, PostTaskViewModel taskViewModel, LtiLaunchData? ltiLaunchData = null);
        Task DeleteTaskAsync(long taskId);
        Task<HomeworkTask> UpdateTaskAsync(long taskId, PostTaskViewModel taskViewModel, ActionOptions options, LtiLaunchData? ltiLaunchData = null);
    }
}
