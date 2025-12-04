using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public class LtiTaskRepository : ILtiTaskRepository
    {
        private readonly ConcurrentDictionary<long, long> _db =
            new ConcurrentDictionary<long, long>();

        public Task<IQueryable<long>> GetAllAsync()
        {
            return Task.FromResult(this._db.Values.AsQueryable()); 
        }

        public Task<IQueryable<long>> FindAlAsync(Expression<Func<long, bool>>? predicate)
        {
            return predicate == null
                ? throw new ArgumentNullException(nameof(predicate))
                : Task.FromResult(this._db.Values.AsQueryable().Where(predicate));
        }

        public Task<long> GetAsync(long id)
        {
            this._db.TryGetValue(id, out var item);
            return Task.FromResult(item);
        }

        public Task<long> FindAsync(Expression<Func<long, bool>> predicate)
        {
            if (predicate == null)
            {
                throw new ArgumentNullException(nameof(predicate));
            }
            var result = this._db.Values.AsQueryable().FirstOrDefault(predicate);
            return Task.FromResult(result);
        }

        public Task AddAsync(long homeworkTaskId, long ltiTaskId)
        {
            this._db.TryAdd(homeworkTaskId, ltiTaskId);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(long homeworkTaskId)
        {
            this._db.TryRemove(homeworkTaskId, out _);
            return Task.CompletedTask;
        }

        public Task UpdateAsync(long homeworkTaskId, long ltiTaskId)
        {
            if (!this._db.TryGetValue(homeworkTaskId, out var current))
            {
                throw new KeyNotFoundException($"Mapping for HomeworkTaskId={homeworkTaskId} not found.");
            }

            this._db[homeworkTaskId] =  ltiTaskId;
            return Task.CompletedTask;
        }
    }
}