using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICourseRepository : ICrudRepository<Course>
    {
        Task<Course> GetWithCourseMatesAsync(long id);
        Task<List<Course>> GetAllWithCourseMatesAsync();
    }
}
