using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class CoursesRepository : CrudRepository<Course, long>, ICoursesRepository
    {
        public CoursesRepository(CourseContext context)
            : base(context)
        {
        }

        public async Task<Course?> GetWithCourseMatesAndHomeworksAsync(long id)
        {
            var course = await Context.Set<Course>()
                .Include(c => c.CourseMates)
                .Include(c => c.Homeworks)
                .ThenInclude(c => c.Tasks)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
            
            // todo: перенести OrderBy в Include после обновления до EF Core 5.x
            course.Homeworks = course.Homeworks.OrderBy(h => h.PublicationDate).ToList();
            return course;
        }

        public IQueryable<Course> GetAllWithCourseMatesAndHomeworks()
        {
            return Context.Set<Course>()
                .Include(c => c.CourseMates)
                .Include(c => c.Homeworks)
                .ThenInclude(c => c.Tasks)
                .AsNoTracking();
        }
    }
}
