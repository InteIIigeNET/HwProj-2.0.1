using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Services
{
    public interface IEntityService<TEntity> where TEntity : class, IEntity
    {
        Task<TEntity> GetAsync(long id);
        Task<TEntity[]> GetAllAsync();
        Task<TEntity[]> GetFilteredAsync(Expression<Func<TEntity, bool>> predicate);

        Task<long> AddAsync(TEntity entity);
        Task DeleteAsync(long id);
        Task UpdateAsync(long id, TEntity update);
    }
}
