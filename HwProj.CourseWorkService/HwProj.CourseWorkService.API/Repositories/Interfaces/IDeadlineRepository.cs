using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories.Interfaces
{
    public interface IDeadlineRepository : ICrudRepository<Deadline, long>
    {
        Task<Deadline> GetDeadlineAsync(long id);
        Task<Deadline[]> FindAllDeadlines(Expression<Func<Deadline, bool>> predicate);
    }
}
