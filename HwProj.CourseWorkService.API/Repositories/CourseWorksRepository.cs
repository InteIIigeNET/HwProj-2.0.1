using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories
{
    public class CourseWorksRepository : CrudRepository<CourseWork>, ICourseWorksRepository
    {
        public CourseWorksRepository(CourseWorkContext context)
           : base(context)
        {
        }
    }
}
