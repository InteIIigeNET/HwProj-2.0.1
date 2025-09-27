using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace HwProj.Repositories.Net8;

public class CrudRepository<TEntity, TKey>(DbContext context) : ICrudRepository<TEntity, TKey>
    where TEntity : class, IEntity<TKey>
    where TKey : IEquatable<TKey>
{
    protected DbContext Context => context;

    public async Task<TKey> AddAsync(TEntity item)
    {
        await context.AddAsync(item);
        await context.SaveChangesAsync();
        return item.Id;
    }

    public async Task<List<TKey>> AddRangeAsync(IEnumerable<TEntity> items)
    {
        items = items.ToList();
        await context.AddRangeAsync(items);
        await context.SaveChangesAsync();
        return items.Select(item => item.Id).ToList();
    }

    public async Task DeleteAsync(TKey id)
    {
        await context.Set<TEntity>()
                .Where(entity => entity.Id.Equals(id))
                .DeleteAsync()
            ;
    }

    public async Task UpdateAsync(TKey id, Expression<Func<TEntity, TEntity>> updateFactory)
    {
        await context.Set<TEntity>()
                .Where(entity => entity.Id.Equals(id))
                .UpdateAsync(updateFactory)
            ;
    }

    public IQueryable<TEntity> GetAll()
    {
        return context.Set<TEntity>().AsNoTracking();
    }

    public IQueryable<TEntity> FindAll(Expression<Func<TEntity, bool>> predicate)
    {
        return context.Set<TEntity>().AsNoTracking().Where(predicate);
    }

    public async Task<TEntity> GetAsync(TKey id)
    {
        return await context.FindAsync<TEntity>(id);
    }

    public async Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> predicate)
    {
        return await context.Set<TEntity>().AsNoTracking().FirstOrDefaultAsync(predicate);
    }
}
