using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories.Net8;
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
            // Раздельные запросы вместо одного JOIN, иначе строки студентов перемножаются со строками задач
            var query = Context.Set<Course>()
                .AsNoTracking()
                .AsSplitQuery()
                .Include(c => c.CourseMates)
                .ThenInclude(c => c.Characteristics)
                .Include(c => c.Homeworks.OrderBy(h => h.PublicationDate).ThenBy(h => h.Id))
                .ThenInclude(h => h.Tasks.OrderBy(t => t.Id));

            return withCriteria
                ? await query.ThenInclude(x => x.Criteria).FirstOrDefaultAsync(c => c.Id == id)
                : await query.FirstOrDefaultAsync(c => c.Id == id);
        }

        public Task<string> GetMentorIdsAsync(long id) =>
            Context.Set<Course>()
                .Where(c => c.Id == id)
                .Select(c => c.MentorIds)
                .SingleAsync();
    }
}
