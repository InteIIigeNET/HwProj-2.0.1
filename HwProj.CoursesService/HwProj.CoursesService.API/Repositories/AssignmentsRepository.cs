using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories
{
    public class AssignmentsRepository : CrudRepository<Assignment, long>, IAssignmentsRepository
    {
        public AssignmentsRepository(CourseContext Context) : base(Context) { }

        public async Task<Assignment[]> GetAllByCourseAsync(long courseId)
        {
            return await Context.Set<Assignment>()
                .Where(a => a.CourseId == courseId)
                .ToArrayAsync();
        }
    }
}
