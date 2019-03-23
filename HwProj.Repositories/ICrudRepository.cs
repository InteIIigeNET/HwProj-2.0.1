using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.Repositories
{
    public interface ICrudRepository<TEntity> : IReadOnlyRepository<TEntity>
        where TEntity : IEntity
    {
        void Add(TEntity item);
        bool Delete(long id);
        bool Update(long id, Expression<Func<TEntity, TEntity>> updateFactory);
        Task AddAsync(TEntity item);
        Task<bool> DeleteAsync(long id);
        Task<bool> UpdateAsync(long id, Expression<Func<TEntity, TEntity>> updateFactory);
    }
}