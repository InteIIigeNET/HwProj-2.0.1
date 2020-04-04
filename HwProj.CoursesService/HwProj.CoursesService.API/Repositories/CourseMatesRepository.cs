using HwProj.Repositories;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Repositories
{
    public class CourseMatesRepository : CrudRepository<CourseMate, long>, ICourseMatesRepository
    {
        public CourseMatesRepository(CourseContext context)
            : base(context)
        {
        }
    }
}