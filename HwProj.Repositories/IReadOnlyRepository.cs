using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.Repositories
{
    public interface IReadOnlyRepository<TEntity>
        where TEntity : IEntity
    {
        TEntity Get(long id);
        IReadOnlyCollection<TEntity> GetAll();
        TEntity Find(Func<TEntity, bool> predicate);
        IReadOnlyCollection<TEntity> FindAll(Func<TEntity, bool> predicate);
        Task<TEntity> GetAsync(long id);
        Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> predicate);
    }
}