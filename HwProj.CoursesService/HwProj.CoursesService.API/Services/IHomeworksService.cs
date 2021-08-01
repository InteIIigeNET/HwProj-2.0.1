using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Services
{
    public interface IHomeworksService
    {
        Task<Homework[]> GetAllHomeworksAsync();
        Task<Homework> GetHomeworkAsync(long homeworkId);
        Task<Homework[]> GetCourseHomeworksAsync(long courseId);
        Task<long> AddHomeworkAsync(long courseId, Homework homework);
        Task DeleteHomeworkAsync(long homeworkId);
        Task UpdateHomeworkAsync(long homeworkId, Homework update);
    }
}
