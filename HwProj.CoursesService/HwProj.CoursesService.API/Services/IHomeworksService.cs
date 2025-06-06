using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.ViewModels;

namespace HwProj.CoursesService.API.Services
{
    public interface IHomeworksService
    {
        Task<Homework> AddHomeworkAsync(long courseId, CreateHomeworkViewModel homeworkViewModel);

        Task<Homework> GetHomeworkAsync(long homeworkId);

        Task<Homework> GetForEditingHomeworkAsync(long homeworkId);

        Task DeleteHomeworkAsync(long homeworkId);

        Task<Homework> UpdateHomeworkAsync(long homeworkId, CreateHomeworkViewModel homeworkViewModel);
    }
}
