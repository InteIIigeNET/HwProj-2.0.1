using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using Z.EntityFramework.Plus;

namespace HwProj.CoursesService.API.Repositories
{
    public class UserToCourseFilterRepository : IUserToCourseFilterRepository
    {
        private readonly CourseContext _context;
        
        UserToCourseFilterRepository(CourseContext context)
        {
            _context = context;
        }
        
        public async Task<UserToCourseFilter> GetAsync(string userId, long courseId)
        {
            return await _context.UserToCourseFilters.FindAsync(userId, courseId);
        }

        public async Task AddAsync(UserToCourseFilter userToCourseFilter)
        {
            await _context.AddAsync(userToCourseFilter).ConfigureAwait(false);
            await _context.SaveChangesAsync().ConfigureAwait(false);
        }

        public async Task UpdateAsync(UserToCourseFilter userToCourseFilter)
        {
            await _context.UserToCourseFilters.UpdateAsync(x => userToCourseFilter);
        }

        public async Task DeleteAsync(string userId, long courseId)
        {
            await _context.UserToCourseFilters.Where(x => 
                    x.UserId == userId && x.CourseId == courseId)
                .DeleteAsync();
        }
    }
}