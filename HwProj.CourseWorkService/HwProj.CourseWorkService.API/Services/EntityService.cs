using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Services
{
    public class EntityService<TEntity> : IEntityService<TEntity> where TEntity : class, IEntity
    {
        private readonly ICrudRepository<TEntity> _entityRepository;

        public EntityService(ICrudRepository<TEntity> entityRepository)
        {
            _entityRepository = entityRepository;
        }

        public async Task<TEntity> GetAsync(long id)
        {
            return await _entityRepository.GetAsync(id);
        }

        public async Task<TEntity[]> GetAllAsync()
        {
            return await _entityRepository.GetAll().ToArrayAsync();
        }

        public async Task<TEntity[]> GetFilteredAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await _entityRepository.FindAll(predicate).ToArrayAsync();
        }

        public async Task<long> AddAsync(TEntity entity)
        {
            return await _entityRepository.AddAsync(entity);
        }

        public async Task DeleteAsync(long id)
        {
            await _entityRepository.DeleteAsync(id);
        }

        public async Task UpdateAsync(long id, TEntity update)
        {
            await _entityRepository.UpdateAsync(id, e => update);
        }
    }
}
