using HwProj.Repositories;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Repositories
{
    public class CourseMateRepository : CrudRepository<CourseMate>, ICourseMateRepository
    {
        public CourseMateRepository(CourseContext context)
            : base(context)
        {
        }
    }
}