using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public interface ITasksRepository : ICrudRepository<HomeworkTask, long>
    {
        Task<HomeworkTask> GetWithHomeworkAsync(long id);
        Task UpdateAsync(long id, Expression<Func<HomeworkTask, HomeworkTask>> updateFunc, List<Criterion> criteria);
        Task<HomeworkTask> GetWithHomeworkAndCriteriaAsync(long id);
    }
}
