using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ILtiTaskRepository
    {
        Task<IQueryable<long>> GetAllAsync();
        Task<IQueryable<long>> FindAlAsync(Expression<Func<long, bool>> predicate);
        Task<long> GetAsync(long id);
        Task<long> FindAsync(Expression<Func<long, bool>> predicate);
        Task AddAsync(long homeworkTaskId, long ltiTaskId);
        Task DeleteAsync(long id);
        Task UpdateAsync(long homeworkTaskId, long ltiTaskId);
    }
}