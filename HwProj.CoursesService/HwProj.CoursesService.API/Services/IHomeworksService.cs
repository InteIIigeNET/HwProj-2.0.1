using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Services
{
    public interface IHomeworksService
    {
        Task<HomeworkViewModel> AddHomeworkAsync(long courseId, CreateHomeworkViewModel homeworkViewModel);

        Task<HomeworkViewModel> GetHomeworkAsync(long homeworkId, bool withCriteria = false);

        Task<HomeworkViewModel> GetForEditingHomeworkAsync(long homeworkId);

        Task DeleteHomeworkAsync(long homeworkId);

        Task<HomeworkViewModel> UpdateHomeworkAsync(long homeworkId, CreateHomeworkViewModel homeworkViewModel);
    }
}
