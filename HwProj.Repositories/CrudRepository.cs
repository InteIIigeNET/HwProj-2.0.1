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
        
        public long Add(TEntity item)
        {
            _context.Add(item);
            _context.SaveChanges();
            return item.Id;
        }

        public void Delete(long id)
            => _context.Set<TEntity>().Where(entity => entity.Id == id).Delete();

        public void Update(long id, Expression<Func<TEntity, TEntity>> updateFactory)
            => _context.Set<TEntity>().Where(entity => entity.Id == id).Update(updateFactory);

        public async Task<long> AddAsync(TEntity item)
        {
            await _context.AddAsync(item);
            await _context.SaveChangesAsync();
            return item.Id;
        }

        public Task DeleteAsync(long id)
            => _context.Set<TEntity>().Where(entity => entity.Id == id).DeleteAsync();

        public Task UpdateAsync(long id, Expression<Func<TEntity, TEntity>> updateFactory)
            => _context.Set<TEntity>().Where(entity => entity.Id == id).UpdateAsync(updateFactory);
    }
}