using System;
using System.Linq;
using System.Linq.Expressions;
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

        public Task<Course?> GetWithCourseMatesAndHomeworksAsync(long id, CourseLoadFilter? filter = null) =>
            IncludeCourseData(Context.Set<Course>(), filter ?? CourseLoadFilter.Empty)
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<Course[]> GetAllWithCourseMatesAndHomeworksAsync(Expression<Func<Course, bool>> predicate,
            CourseLoadFilter? filter = null)
        {
            return await IncludeCourseData(Context.Set<Course>().Where(predicate), filter ?? CourseLoadFilter.Empty)
                .ToArrayAsync();
        }

        public Task<string> GetMentorIdsAsync(long id) =>
            Context.Set<Course>()
                .Where(c => c.Id == id)
                .Select(c => c.MentorIds)
                .SingleAsync();

        private static IQueryable<Course> IncludeCourseData(IQueryable<Course> courses, CourseLoadFilter filter)
        {
            var publishedBefore = filter.PublishedBefore;
            var courseMateId = filter.CourseMateId;

            // Раздельные запросы вместо одного JOIN, иначе строки студентов перемножаются со строками задач
            var query = courses
                .AsNoTracking()
                .AsSplitQuery();

            var withCourseMates = query
                .Include(c => c.CourseMates.Where(cm => courseMateId == null || cm.StudentId == courseMateId));
            query = withCourseMates;
            if (filter.IncludeCharacteristics) query = withCourseMates.ThenInclude(cm => cm.Characteristics);

            var withTasks = query
                .Include(c => c.Homeworks
                    .Where(h => publishedBefore == null || h.PublicationDate <= publishedBefore)
                    .OrderBy(h => h.PublicationDate)
                    .ThenBy(h => h.Id))
                .ThenInclude(h => h.Tasks
                    .Where(t => publishedBefore == null || t.PublicationDate == null ||
                                t.PublicationDate <= publishedBefore)
                    .OrderBy(t => t.Id));
            query = withTasks;
            if (filter.IncludeCriteria) query = withTasks.ThenInclude(t => t.Criteria);

            return query;
        }
    }
}
