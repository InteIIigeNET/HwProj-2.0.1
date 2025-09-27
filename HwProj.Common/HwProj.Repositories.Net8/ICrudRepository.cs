using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.Repositories.Net8
{
    public interface ICrudRepository<TEntity, TKey> : IReadOnlyRepository<TEntity, TKey>
        where TEntity : IEntity<TKey>
        where TKey : IEquatable<TKey>
    {
        Task<TKey> AddAsync(TEntity item);
        Task<List<TKey>> AddRangeAsync(IEnumerable<TEntity> items);
        Task DeleteAsync(TKey id);
        Task UpdateAsync(TKey id, Expression<Func<TEntity, TEntity>> updateFactory);
    }
}
