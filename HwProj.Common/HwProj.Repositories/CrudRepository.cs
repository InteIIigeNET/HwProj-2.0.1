using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace HwProj.Repositories
{
    public class CrudRepository<TEntity> : ReadOnlyRepository<TEntity>, ICrudRepository<TEntity>
        where TEntity : class, IEntity, new()
    {
        public CrudRepository(DbContext context)
            : base(context)
        {
        }

        public async Task<long> AddAsync(TEntity item)
        {
            await Context.AddAsync(item);
            await Context.SaveChangesAsync();
            return item.Id;
        }

        public async Task DeleteAsync(long id)
        {
            await Context.Set<TEntity>().Where(entity => entity.Id == id).DeleteAsync();
        }

        public async Task UpdateAsync(long id, Expression<Func<TEntity, TEntity>> updateFactory)
        {
            await Context.Set<TEntity>().Where(entity => entity.Id == id).UpdateAsync(updateFactory);
        }
    }
}