using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class CourseFilterRepository : CrudRepository<CourseFilter, long>, ICourseFilterRepository
    {
        public CourseFilterRepository(CourseContext context) : base(context)
        {
        }

        public async Task<CourseFilter?> GetAsync(string userId, long courseId)
        {
            var userToCourseFilter = await Context.Set<UserToCourseFilter>()
                .Include(ucf => ucf.CourseFilter)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == userId && u.CourseId == courseId);

            return userToCourseFilter?.CourseFilter;
        }

        public async Task<long> AddAsync(CourseFilter courseFilter, string userId, long courseId)
        {
            using var transaction = await Context.Database.BeginTransactionAsync();
            try
            {
                Context.Set<CourseFilter>().Add(courseFilter);
                await Context.SaveChangesAsync();
                var filterId = courseFilter.Id;
                var userToCourseFilter = new UserToCourseFilter
                {
                    CourseFilterId = filterId,
                    CourseId = courseId,
                    UserId = userId
                };

                Context.Set<UserToCourseFilter>().Add(userToCourseFilter);
                await Context.SaveChangesAsync();
                transaction.Commit();

                return filterId;
            }
            catch (DbUpdateException ex)
            {
                transaction.Rollback();
                return -1;
            }
        }
    }
}