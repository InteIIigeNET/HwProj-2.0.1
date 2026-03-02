using System.Collections.Generic;
using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ITasksRepository : ICrudRepository<HomeworkTask, long>
    {
        Task AddLtiUrlAsync(long taskId, LtiLaunchData ltiLaunchData);
        Task<LtiLaunchData?> GetLtiDataAsync(long taskId);
        Task<Dictionary<long, LtiLaunchData>> GetLtiDataForTasksAsync(IEnumerable<long> taskIds);
        Task<HomeworkTask> GetWithHomeworkAsync(long id);
        Task UpdateAsync(long id, Expression<Func<HomeworkTask, HomeworkTask>> updateFunc, List<Criterion> criteria);
        Task<HomeworkTask> GetWithHomeworkAndCriteriaAsync(long id);
    }
}
