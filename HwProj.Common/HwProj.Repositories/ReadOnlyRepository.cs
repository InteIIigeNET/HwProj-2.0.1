﻿using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace HwProj.Repositories
{
    public class ReadOnlyRepository<TEntity, T> : IReadOnlyRepository<TEntity, T>
        where TEntity : class, IEntity<T>, new()
        where T : IEquatable<T>
    {
        protected readonly DbContext Context;

        public ReadOnlyRepository(DbContext context)
        {
            Context = context;
        }

        public IQueryable<TEntity> GetAll()
        {
            return Context.Set<TEntity>().AsNoTracking();
        }

        public IQueryable<TEntity> FindAll(Expression<Func<TEntity, bool>> predicate)
        {
            return Context.Set<TEntity>().AsNoTracking().Where(predicate);
        }

        public async Task<TEntity> GetAsync(long id)
        {
            return await Context.FindAsync<TEntity>(id);
        }

        public async Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await Context.Set<TEntity>().AsNoTracking().FirstOrDefaultAsync(predicate);
        }
    }
}