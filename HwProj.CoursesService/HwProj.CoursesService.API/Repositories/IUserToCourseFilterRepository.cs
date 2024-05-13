using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IUserToCourseFilterRepository
    {
        Task<UserToCourseFilter> GetAsync(string userId, long courseId);
        IQueryable<UserToCourseFilter> FindAll(Expression<Func<UserToCourseFilter, bool>> predicate);
        Task AddAsync(UserToCourseFilter userToCourseFilter);
        public Task AddAllAsync(IEnumerable<UserToCourseFilter> entities);
        Task UpdateAsync(UserToCourseFilter userToCourseFilter);
        Task DeleteAsync(string userId, long courseId);
    }
}