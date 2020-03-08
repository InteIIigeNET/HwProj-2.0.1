using HwProj.CourseWorkService.API.Models;
using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public interface IDeadlineService
    {
        Task<Deadline> GetDeadlineAsync(long deadlineId);
        Task<Deadline[]> GetAllDeadlinesAsync();
        Task<Deadline[]> GetFilteredDeadlinesAsync(Expression<Func<Deadline, bool>> predicate);

        Task<long> AddDeadlineAsync(Deadline deadline);
        Task DeleteDeadlineAsync(long deadlineId);
        Task UpdateDeadlineAsync(long deadlineId, Deadline update);
    }
}
