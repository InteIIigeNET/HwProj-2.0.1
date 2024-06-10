using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace HwProj.CoursesService.API.Repositories
{
    public class UserToCourseFilterRepository : IUserToCourseFilterRepository
    {
        private readonly CourseContext _context;
        
        public UserToCourseFilterRepository(CourseContext context)
        {
            _context = context;
        }
        
        public async Task<UserToCourseFilter> GetAsync(string userId, long courseId)
        {
            return await _context.FindAsync<UserToCourseFilter>(courseId, userId).ConfigureAwait(false);
        }

        public async Task AddAllAsync(IEnumerable<UserToCourseFilter> entities)
        { 
            await _context.AddRangeAsync(entities);
        }

        public IQueryable<UserToCourseFilter> FindAll(Expression<Func<UserToCourseFilter, bool>> predicate)
        {
            return _context.Set<UserToCourseFilter>().AsNoTracking().Where(predicate);
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
                    x.UserId == userId && x.CourseId == courseId).AsNoTracking()
                .DeleteAsync();
        }
    }
}