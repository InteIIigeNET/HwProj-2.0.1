using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class CourseFilterRepository : CrudRepository<CourseFilter, long>, ICourseFilterRepository
    {
        public CourseFilterRepository(DbContext context) : base(context)
        {
        }
    }
}