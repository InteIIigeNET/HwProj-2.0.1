using HwProj.Repositories;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public class CourseMateRepository : CrudRepository<CourseMate>, ICourseMateRepository
    {
        public CourseMateRepository(CourseContext context)
            : base(context)
        {
        }
    }
}