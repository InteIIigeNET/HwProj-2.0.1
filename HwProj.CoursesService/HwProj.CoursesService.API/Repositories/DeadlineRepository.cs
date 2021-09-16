using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public class DeadlinesRepository : CrudRepository<Deadline, long>, IDeadlinesRepository
    {
        public DeadlinesRepository(CourseContext context)
            : base(context)
        {
        }
    }
}
