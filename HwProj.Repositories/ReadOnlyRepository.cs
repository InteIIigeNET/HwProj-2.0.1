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

        public IReadOnlyCollection<TEntity> FindAll(Func<TEntity, bool> predicate)
            => _context.Set<TEntity>().AsNoTracking().AsEnumerable().Where(predicate).ToArray();

        public Task<TEntity> GetAsync(long id)
            => _context.FindAsync<TEntity>(id);

        public Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> predicate)
            => _context.Set<TEntity>().FirstOrDefaultAsync(predicate);
    }
}