using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICoursesRepository : ICrudRepository<Course, long>
    {
        Task<Course> GetWithCourseMatesAsync(long id);
        IQueryable<Course> GetAllWithCourseMatesAndHomeworks();
    }
}
