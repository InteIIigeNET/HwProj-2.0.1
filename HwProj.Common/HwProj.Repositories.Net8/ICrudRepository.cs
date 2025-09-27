using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.Repositories.Net8;

public interface ICrudRepository<TEntity, TKey>
    where TEntity : IEntity<TKey>
    where TKey : IEquatable<TKey>
{
    Task<TKey> AddAsync(TEntity item);
    Task<List<TKey>> AddRangeAsync(IEnumerable<TEntity> items);
    Task DeleteAsync(TKey id);
    Task UpdateAsync(TKey id, Expression<Func<TEntity, TEntity>> updateFactory);
    IQueryable<TEntity> GetAll();
    IQueryable<TEntity> FindAll(Expression<Func<TEntity, bool>> predicate);
    Task<TEntity> GetAsync(TKey id);
    Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> predicate);
}
