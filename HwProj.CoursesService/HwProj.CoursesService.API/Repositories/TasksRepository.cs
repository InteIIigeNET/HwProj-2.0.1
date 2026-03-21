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

        private async Task UpdateCriteria(List<Criterion> criteria, long taskId)
        {
            var criteriaToCheck = await Context.Set<Criterion>()
                .AsNoTracking()
                .Where(x => x.TaskId == taskId)
                .ToDictionaryAsync(x => x.Id, x => x);

            var criteriaToAdd = new List<Criterion>();
            var criteriaToUpdate = new List<Criterion>();

            foreach (var criterion in criteria)
            {
                criterion.TaskId = taskId;

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

        public async Task AddOrUpdateLtiLaunchDataAsync(long taskId, LtiLaunchData ltiLaunchData)
        {
            var existingRecord = await Context.Set<HomeworkTaskLtiLaunchData>().FindAsync(taskId);

            if (existingRecord != null)
            {
                existingRecord.LtiLaunchUrl = ltiLaunchData.LtiLaunchUrl;
                existingRecord.CustomParams = ltiLaunchData.CustomParams;
                Context.Set<HomeworkTaskLtiLaunchData>().Update(existingRecord);
            }
            else
            {
                var ltiRecord = new HomeworkTaskLtiLaunchData
                {
                    TaskId = taskId,
                    LtiLaunchUrl = ltiLaunchData.LtiLaunchUrl,
                    CustomParams = ltiLaunchData.CustomParams
                };
                await Context.Set<HomeworkTaskLtiLaunchData>().AddAsync(ltiRecord);
            }
    
            await Context.SaveChangesAsync();
        }

        public async Task AddRangeLtiLaunchDataAsync(IEnumerable<HomeworkTaskLtiLaunchData> ltiLaunchData)
        {
            var ltiLaunchDataList = ltiLaunchData as HomeworkTaskLtiLaunchData[] ?? ltiLaunchData.ToArray();
            if (!ltiLaunchDataList.Any())
            {
                return;
            }

            await Context.Set<HomeworkTaskLtiLaunchData>().AddRangeAsync(ltiLaunchDataList);

            await Context.SaveChangesAsync();
        }

        public async Task<LtiLaunchData?> GetLtiDataAsync(long taskId)
        {
            var record = await Context.Set<HomeworkTaskLtiLaunchData>().FindAsync(taskId);
            
            return record == null ? null : new LtiLaunchData 
            {
                LtiLaunchUrl = record.LtiLaunchUrl,
                CustomParams = record.CustomParams
            };
        }

        public async Task<Dictionary<long, LtiLaunchData>> GetLtiDataForTasksAsync(IEnumerable<long> taskIds)
        {
            return await Context.Set<HomeworkTaskLtiLaunchData>()
                .Where(t => taskIds.Contains(t.TaskId))
                .ToDictionaryAsync(t => t.TaskId, t => new LtiLaunchData
                {
                    LtiLaunchUrl = t.LtiLaunchUrl,
                    CustomParams = t.CustomParams
                });
        }

        public async Task UpdateAsync(long id, Expression<Func<HomeworkTask, HomeworkTask>> updateFunc,
            List<Criterion> criteria)
        {
            using var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            await UpdateAsync(id, updateFunc);
            await UpdateCriteria(criteria, id);

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
