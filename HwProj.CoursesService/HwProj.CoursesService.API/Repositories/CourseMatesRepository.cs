using HwProj.CoursesService.API.Models;
using HwProj.Repositories.Net8;

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