using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.Repositories
{
    public interface IReadOnlyRepository<TEntity>
        where TEntity : IEntity
    {
        TEntity Get(long id);
        IReadOnlyCollection<TEntity> GetAll();
        TEntity Find(Func<TEntity, bool> predicate);
        IReadOnlyCollection<TEntity> FindAll(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity> GetAsync(long id);
        Task<TEntity[]> GetAllAsync();
        Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity[]> FindAllAsync(Expression<Func<TEntity, bool>> predicate);
        
        TEntity Get<TProperty>(long id, Expression<Func<TEntity,TProperty>> includeProperty);
        IReadOnlyCollection<TEntity> GetAll<TProperty>(Expression<Func<TEntity,TProperty>> includeProperty);
        TEntity Find<TProperty>(Func<TEntity, bool> predicate, Expression<Func<TEntity,TProperty>> includeProperty);
        IReadOnlyCollection<TEntity> FindAll<TProperty>(Expression<Func<TEntity, bool>> predicate, Expression<Func<TEntity,TProperty>> includeProperty);
        Task<TEntity> GetAsync<TProperty>(long id, Expression<Func<TEntity,TProperty>> includeProperty);
        Task<TEntity[]> GetAllAsync<TProperty>(Expression<Func<TEntity, TProperty>> includeProperty);
        Task<TEntity> FindAsync<TProperty>(Expression<Func<TEntity, bool>> predicate, Expression<Func<TEntity,TProperty>> includeProperty);
        Task<TEntity[]> FindAllAsync<TProperty>(Expression<Func<TEntity, bool>> predicate, Expression<Func<TEntity,TProperty>> includeProperty);
    }
}