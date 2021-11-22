using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Services
{
    public interface IHomeworksService
    {
        Task<long> AddHomeworkAsync(long courseId, Homework homework);

        Task<Homework> GetHomeworkAsync(long homeworkId);

        Task<Homework[]> GetAllHomeworkFromCourseAsync(long courseId);

        Task DeleteHomeworkAsync(long homeworkId);
        
        Task UpdateHomeworkAsync(long homeworkId, Homework update);
    }
}
