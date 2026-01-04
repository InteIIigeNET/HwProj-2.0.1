using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using System.Transactions;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class TasksRepository : CrudRepository<HomeworkTask, long>, ITasksRepository
    {
        public TasksRepository(CourseContext context)
            : base(context)
        {
        }

        private async Task UpdateCriteria(List<Criterion> criteria)
        {
            var taskIds = criteria.Select(x => x.TaskId).ToList();
            var criteriaToCheck = await Context.Set<Criterion>()
                .AsNoTracking()
                .Where(x => taskIds.Contains(x.TaskId))
                .ToDictionaryAsync(x => x.Id, x => x);

            var criteriaToAdd = new List<Criterion>();
            var criteriaToUpdate = new List<Criterion>();

            foreach (var criterion in criteria)
            {
                if (criterion.Id == 0) criteriaToAdd.Add(criterion);
                else if (criteriaToCheck.TryGetValue(criterion.Id, out var existingCriterion))
                {
                    if (!_criterionComparer.Equals(criterion, existingCriterion))
                        criteriaToUpdate.Add(criterion);

                    criteriaToCheck.Remove(criterion.Id);
                }
            }

            Context.Set<Criterion>().AddRange(criteriaToAdd);
            Context.Set<Criterion>().RemoveRange(criteriaToCheck.Values);
            Context.Set<Criterion>().UpdateRange(criteriaToUpdate);
        }

        public Task<HomeworkTask> GetWithHomeworkAsync(long id)
        {
            return Context.Set<HomeworkTask>()
                .Include(x => x.Homework)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task UpdateAsync(long id, Expression<Func<HomeworkTask, HomeworkTask>> updateFunc,
            List<Criterion> criteria)
        {
            using var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            await UpdateAsync(id, updateFunc);

            foreach (var criterion in criteria) criterion.TaskId = id;
            await UpdateCriteria(criteria);

            await Context.SaveChangesAsync();
            transactionScope.Complete();
        }


        public Task<HomeworkTask> GetWithHomeworkAndCriteriaAsync(long id)
        {
            return Context.Set<HomeworkTask>()
                .Include(x => x.Homework)
                .Include(x => x.Criteria)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        private static readonly CriterionComparer _criterionComparer = new CriterionComparer();

        private class CriterionComparer : IEqualityComparer<Criterion>
        {
            public bool Equals(Criterion? x, Criterion? y)
            {
                if (ReferenceEquals(x, y)) return true;
                if (x is null) return false;
                if (y is null) return false;
                return x.Id == y.Id &&
                       x.TaskId == y.TaskId &&
                       x.Type == y.Type &&
                       x.Name == y.Name &&
                       x.MaxPoints == y.MaxPoints;
            }

            public int GetHashCode(Criterion obj) => HashCode.Combine(obj.Id, obj.TaskId, obj.Name);
        }
    }
}
