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

        public bool Delete(long id)
            => _context.Set<TEntity>().Where(entity => entity.Id == id).Delete() == 1;

        public bool Update(long id, Expression<Func<TEntity, TEntity>> updateFactory)
            => _context.Set<TEntity>().Where(entity => entity.Id == id).Update(updateFactory) == 1;

        public async Task AddAsync(TEntity item)
        {
            await _context.AddAsync(item);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(long id)
            => await _context.Set<TEntity>().Where(entity => entity.Id == id).DeleteAsync() == 1;

        public async Task<bool> UpdateAsync(long id, Expression<Func<TEntity, TEntity>> updateFactory)
            => await _context.Set<TEntity>().Where(entity => entity.Id == id).UpdateAsync(updateFactory) == 1;
    }
}