using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ICourseFilterRepository : ICrudRepository<CourseFilter, long>
    {
        
    }
}