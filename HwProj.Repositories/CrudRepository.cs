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
        
        public void Add(TEntity item)
        {
            _context.Add(item);
            _context.SaveChanges();
        }

        public void Delete(long id)
            => _context.Set<TEntity>().Where(entity => entity.Id == id).Delete();

        public void Update(long id, Expression<Func<TEntity, TEntity>> updateFactory)
            => _context.Set<TEntity>().Where(entity => entity.Id == id).Update(updateFactory);

        public async Task AddAsync(TEntity item)
        {
            await _context.AddAsync(item);
            await _context.SaveChangesAsync();
        }

        public Task DeleteAsync(long id)
            => _context.Set<TEntity>().Where(entity => entity.Id == id).DeleteAsync();

        public Task UpdateAsync(long id, Expression<Func<TEntity, TEntity>> updateFactory)
            => _context.Set<TEntity>().Where(entity => entity.Id == id).UpdateAsync(updateFactory);
    }
}