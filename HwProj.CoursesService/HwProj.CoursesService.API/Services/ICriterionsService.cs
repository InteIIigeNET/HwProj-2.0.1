using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Services
{
    public interface ICriterionsService
    {
        public Task AddCriterionsAsync(CreateHomeworkViewModel homeworkViewModel, IReadOnlyList<HomeworkTask> tasks);

        public Task UpdateTaskCriteriaAsync(EditTaskViewModel taskViewModel, long taskId);

        public Task<List<Criterion>> GetTaskCriteriaAsync(long taskId);
        public Task DeleteCriteriaByTaskIdAsync(long taskId);

        public Task DeleteCriteriaFromHomeworkAsync(long homeworkId);

        public Task AddCriterionAsync(List<CriterionViewModel>? criterias, long taskId);
    }
}
