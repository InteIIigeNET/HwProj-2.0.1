using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.Repositories
{
    public interface IReadOnlyRepository<TEntity, TKey>
        where TEntity : IEntity<TKey>
        where TKey : IEquatable<TKey>
    {
        IQueryable<TEntity> GetAll();
        IQueryable<TEntity> FindAll(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity> GetAsync(TKey id);
        Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> predicate);
    }
}
