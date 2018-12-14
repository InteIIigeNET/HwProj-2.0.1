using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Linq.Expressions;
using Z.EntityFramework.Plus;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public abstract class BaseRepository<T> : ICrudRepository<T>
        where T : class, new()
    {
        private readonly DbContext _context;

        public BaseRepository(DbContext context)
        {
            _context = context;
        }

        protected abstract IQueryable<T> GetEntities();

        protected IQueryable<T> GetAllEntites()
            => _context.Set<T>();

        public IReadOnlyCollection<T> GetAll()
            => GetEntities()
                .AsNoTracking().ToArray();

        public async Task<T> GetAsync(Expression<Func<T, bool>> predicate)
            => await GetEntities()
                .Where(predicate)
                .FirstOrDefaultAsync();
        
        public async Task AddAsync(T item)
        {
            await _context.Set<T>().AddAsync(item);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ContainsAsync(Expression<Func<T, bool>> predicate)
            => await _context.Set<T>().Where(predicate).AnyAsync();

        public async Task<bool> DeleteAsync(Expression<Func<T, bool>> predicate)
            => await _context.Set<T>().Where(predicate).DeleteAsync() == 1;

        public async Task<bool> UpdateAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, T>> updateFactory)
            => await _context.Set<T>().Where(predicate).UpdateAsync(updateFactory) == 1;

        protected Task SaveAsync()
            => _context.SaveChangesAsync();

    }
}
