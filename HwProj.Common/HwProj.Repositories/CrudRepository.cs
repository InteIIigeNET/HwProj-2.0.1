using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace HwProj.Repositories
{
    public class CrudRepository<TEntity, TKey> : ReadOnlyRepository<TEntity, TKey>, ICrudRepository<TEntity, TKey>
        where TEntity : class, IEntity<TKey>, new()
        where TKey : IEquatable<TKey>
    {
        public CrudRepository(DbContext context)
            : base(context)
        {
        }

        public async Task<TKey> AddAsync(TEntity item)
        {
            await Context.AddAsync(item).ConfigureAwait(false);
            await Context.SaveChangesAsync().ConfigureAwait(false);
            return item.Id;
        }

        public async Task<List<TKey>> AddRangeAsync(IEnumerable<TEntity> items)
        {
            items = items.ToList();
            await Context.AddRangeAsync(items).ConfigureAwait(false);
            await Context.SaveChangesAsync().ConfigureAwait(false);
            return items.Select(item => item.Id).ToList();
        }

        public async Task DeleteAsync(TKey id)
        {
            await Context.Set<TEntity>()
                .Where(entity => entity.Id.Equals(id))
                .DeleteAsync()
                .ConfigureAwait(false);
        }

        public async Task UpdateAsync(TKey id, Expression<Func<TEntity, TEntity>> updateFactory)
        {
            await Context.Set<TEntity>()
                .Where(entity => entity.Id.Equals(id))
                .UpdateAsync(updateFactory)
                .ConfigureAwait(false);
        }
    }
}
