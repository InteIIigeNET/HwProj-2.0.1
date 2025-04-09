using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Services
{
    public interface IHomeworksService
    {
        Task<long> AddHomeworkAsync(long courseId, Homework homework);

        Task<Homework> GetHomeworkAsync(long homeworkId);

        Task<Homework> GetForEditingHomeworkAsync(long homeworkId);

        Task DeleteHomeworkAsync(long homeworkId);

        Task<Homework> UpdateHomeworkAsync(long homeworkId, Homework update);
    }
}
