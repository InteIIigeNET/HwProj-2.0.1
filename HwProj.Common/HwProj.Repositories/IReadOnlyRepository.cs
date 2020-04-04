using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.Repositories
{
    public interface IReadOnlyRepository<TEntity, T>
        where TEntity : IEntity<T>
        where T : IEquatable<T>
    {
        IQueryable<TEntity> GetAll();
        IQueryable<TEntity> FindAll(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity> GetAsync(long id);
        Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> predicate);
    }
}
