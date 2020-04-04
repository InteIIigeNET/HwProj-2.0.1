using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.Repositories
{
    public interface ICrudRepository<TEntity, T> : IReadOnlyRepository<TEntity, T>
        where TEntity : IEntity<T>
        where T : IEquatable<T>
    {
        Task<T> AddAsync(TEntity item);
        Task DeleteAsync(T id);
        Task UpdateAsync(T id, Expression<Func<TEntity, TEntity>> updateFactory);
    }
}