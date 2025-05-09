using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    // TODO: include mentors by default
    public class CoursesRepository : CrudRepository<Course, long>, ICoursesRepository
    {
        public CoursesRepository(CourseContext context)
            : base(context)
        {
        }

        public override async Task<Course> FindAsync(Expression<Func<Course, bool>> predicate)
        {
            return await Context.Set<Course>().AsNoTracking().Include(x => x.Mentors).FirstOrDefaultAsync(predicate);
        }

        public Task<Course?> GetWithCourseMates(long id) =>
            Context.Set<Course>()
                .Include(x => x.Mentors)
                .Include(c => c.CourseMates)
                .ThenInclude(c => c.Characteristics)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<Course?> GetWithHomeworksAsync(long id)
            => await Context.Set<Course>()
                .Include(x => x.Mentors)
                .Include(c => c.Homeworks)
                .ThenInclude(h => h.Tasks)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<Course?> GetWithCourseMatesAndHomeworksAsync(long id)
        {
            var course = await Context.Set<Course>()
                .Include(x => x.Mentors)
                .Include(c => c.CourseMates)
                .ThenInclude(c => c.Characteristics)
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
                .Include(x => x.Mentors)
                .Include(c => c.CourseMates)
                .ThenInclude(c => c.Characteristics)
                .Include(c => c.Homeworks)
                .ThenInclude(c => c.Tasks)
                .AsNoTracking();
        }
    }
}
