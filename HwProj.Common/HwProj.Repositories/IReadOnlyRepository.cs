using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.Repositories
{
    public interface IReadOnlyRepository<TEntity>
        where TEntity : IEntity
    {
        Task<TEntity[]> GetAllAsync();
        Task<TEntity[]> FindAllAsync(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity> GetAsync(long id);
        Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> predicate);
    }
}