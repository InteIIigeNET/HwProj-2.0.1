using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public class CourseFilterRepository : CrudRepository<CourseFilter, long>, ICourseFilterRepository
    {
        public CourseFilterRepository(CourseContext context) : base(context)
        {
        }
    }
}