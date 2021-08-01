using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IHomeworksRepository : ICrudRepository<Homework, long>
    {
        Task<Homework[]> GetAllWithTasksAsync();
        Task<Homework[]> GetAllWithTasksByCourseAsync(long courseId);
        Task<Homework> GetWithTasksAsync(long id);
    }
}
