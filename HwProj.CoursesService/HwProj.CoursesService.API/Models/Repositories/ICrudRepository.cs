using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public interface ICrudRepository<T> : IReadOnlyRepository<T>
        where T : class, new()
    {
        Task AddAsync(T item);
        Task<bool> DeleteAsync(Expression<Func<T, bool>> predicate);
        Task<bool> UpdateAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, T>> updateFactory);
    }
}
