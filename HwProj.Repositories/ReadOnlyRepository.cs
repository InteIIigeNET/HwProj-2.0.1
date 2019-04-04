using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace HwProj.Repositories
{
    public class ReadOnlyRepository<TEntity> : IReadOnlyRepository<TEntity>
        where TEntity : class, IEntity, new()
    {
        protected readonly DbContext _context;

        public ReadOnlyRepository(DbContext context)
        {
            _context = context;
        }
        
        public TEntity Get(long id)
            => _context.Find<TEntity>(id);

        public IReadOnlyCollection<TEntity> GetAll()
            => _context.Set<TEntity>().AsNoTracking().ToArray();

        public TEntity Find(Func<TEntity, bool> predicate)
            => _context.Set<TEntity>().FirstOrDefault(predicate);

        public IReadOnlyCollection<TEntity> FindAll(Expression<Func<TEntity, bool>> predicate)
            => _context.Set<TEntity>().Where(predicate).AsNoTracking().ToArray();

        public Task<TEntity> GetAsync(long id)
            => _context.FindAsync<TEntity>(id);

        public Task<TEntity[]> GetAllAsync()
            => _context.Set<TEntity>().ToArrayAsync();

        public Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> predicate)
            => _context.Set<TEntity>().FirstOrDefaultAsync(predicate);

        public Task<TEntity[]> FindAllAsync(Expression<Func<TEntity, bool>> predicate)
            => _context.Set<TEntity>().Where(predicate).ToArrayAsync();
        
        public TEntity Get<TProperty>(long id, Expression<Func<TEntity, TProperty>> includeQuery)
            => _context.Set<TEntity>().Include(includeQuery).FirstOrDefault(e => e.Id == id);

        public IReadOnlyCollection<TEntity> GetAll<TProperty>(Expression<Func<TEntity, TProperty>> includeQuery)
            => _context.Set<TEntity>().Include(includeQuery).AsNoTracking().ToArray();

        public TEntity Find<TProperty>(Func<TEntity, bool> predicate,
            Expression<Func<TEntity, TProperty>> includeQuery)
            => _context.Set<TEntity>().Include(includeQuery).FirstOrDefault(predicate);

        public IReadOnlyCollection<TEntity> FindAll<TProperty>(Expression<Func<TEntity, bool>> predicate,
            Expression<Func<TEntity, TProperty>> includeQuery)
            => _context.Set<TEntity>().Include(includeQuery).Where(predicate).AsNoTracking().ToArray();

        public Task<TEntity> GetAsync<TProperty>(long id, Expression<Func<TEntity, TProperty>> includeQuery)
            => _context.Set<TEntity>().Include(includeQuery).FirstOrDefaultAsync(e => e.Id == id);
        
        public Task<TEntity[]> GetAllAsync<TProperty>(Expression<Func<TEntity, TProperty>> includeQuery)
            => _context.Set<TEntity>().Include(includeQuery).AsNoTracking().ToArrayAsync();

        public Task<TEntity> FindAsync<TProperty>(Expression<Func<TEntity, bool>> predicate,
            Expression<Func<TEntity, TProperty>> includeQuery)
            => _context.Set<TEntity>().Include(includeQuery).FirstOrDefaultAsync(predicate);

        public Task<TEntity[]> FindAllAsync<TProperty>(Expression<Func<TEntity, bool>> predicate,
            Expression<Func<TEntity, TProperty>> includeQuery)
            => _context.Set<TEntity>().Include(includeQuery).Where(predicate).AsNoTracking().ToArrayAsync();
    }
}