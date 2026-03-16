using HwProj.CoursesService.API.Models;
using System.Linq;
using System.Threading.Tasks;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICoursesRepository : ICrudRepository<Course, long>
    {
        Task<Course?> GetWithCourseMates(long id);
        Task<Course?> GetWithHomeworksAsync(long id);
        Task<Course?> GetWithCourseMatesAndHomeworksAsync(long id, bool withCriteria = false);
        IQueryable<Course> GetAllWithCourseMatesAndHomeworks();
    }
}
