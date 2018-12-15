using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Models.Repositories
{
    public abstract class ReadOnlyRepository<T> : IReadOnlyRepository<T>
        where T : class, new()
    {
        private readonly DbContext _context;

        public ReadOnlyRepository(DbContext context)
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

        public async Task<bool> ContainsAsync(Expression<Func<T, bool>> predicate)
            => await _context.Set<T>().Where(predicate).AnyAsync();
    }
}
