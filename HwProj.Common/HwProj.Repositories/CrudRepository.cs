using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace HwProj.Repositories
{
    public class CrudRepository<TEntity, T> : ReadOnlyRepository<TEntity, T>, ICrudRepository<TEntity, T>
        where TEntity : class, IEntity<T>, new()
        where T : IEquatable<T>
    {
        public CrudRepository(DbContext context)
            : base(context)
        {
        }

        public async Task<T> AddAsync(TEntity item)
        {
            await Context.AddAsync(item);
            await Context.SaveChangesAsync();
            return item.Id;
        }

        public async Task DeleteAsync(T id)
        {
            await Context.Set<TEntity>().Where(entity => entity.Id.Equals(id)).DeleteAsync();
        }

        public async Task UpdateAsync(T id, Expression<Func<TEntity, TEntity>> updateFactory)
        {
            await Context.Set<TEntity>().Where(entity => entity.Id.Equals(id)).UpdateAsync(updateFactory);
        }
    }
}