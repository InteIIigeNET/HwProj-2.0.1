using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.Repositories
{
    public interface ICrudRepository<TEntity, TKey> : IReadOnlyRepository<TEntity, TKey>
        where TEntity : IEntity<TKey>
        where TKey : IEquatable<TKey>
    {
        Task<TKey> AddAsync(TEntity item);
        Task DeleteAsync(TKey id);
        Task UpdateAsync(TKey id, Expression<Func<TEntity, TEntity>> updateFactory);
    }
}