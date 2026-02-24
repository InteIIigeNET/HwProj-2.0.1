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

        public Task<Course?> GetWithCourseMates(long id) =>
            Context.Set<Course>()
                .Include(c => c.CourseMates)
                .ThenInclude(c => c.Characteristics)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<Course?> GetWithHomeworksAsync(long id)
            => await Context.Set<Course>()
                .Include(c => c.Homeworks)
                .ThenInclude(h => h.Tasks)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<Course?> GetWithCourseMatesAndHomeworksAsync(long id, bool withCriteria)
        {
            var query = Context.Set<Course>()
                .AsNoTracking()
                .Include(c => c.CourseMates)
                .ThenInclude(c => c.Characteristics)
                .Include(c => c.Homeworks)
                .ThenInclude(c => c.Tasks);

            var course = withCriteria
                ? await query.ThenInclude(x => x.Criteria).FirstOrDefaultAsync(c => c.Id == id)
                : await query.FirstOrDefaultAsync(c => c.Id == id);

            // todo: перенести OrderBy в Include после обновления до EF Core 5.x
            course.Homeworks = course.Homeworks.OrderBy(h => h.PublicationDate).ToList();
            return course;
        }

        public IQueryable<Course> GetAllWithCourseMatesAndHomeworks()
        {
            return Context.Set<Course>()
                .Include(c => c.CourseMates)
                .ThenInclude(c => c.Characteristics)
                .Include(c => c.Homeworks)
                .ThenInclude(c => c.Tasks)
                .AsNoTracking();
        }
    }
}
