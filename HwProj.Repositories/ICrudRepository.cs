using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.Repositories
{
    public interface ICrudRepository<TEntity> : IReadOnlyRepository<TEntity>
        where TEntity : IEntity
    {
        long Add(TEntity item);
        void Delete(long id);
        void Update(long id, Expression<Func<TEntity, TEntity>> updateFactory);
        Task<long> AddAsync(TEntity item);
        Task DeleteAsync(long id);
        Task UpdateAsync(long id, Expression<Func<TEntity, TEntity>> updateFactory);
    }
}