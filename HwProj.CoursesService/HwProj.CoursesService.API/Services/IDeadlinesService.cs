using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Models.CoursesService.DTO;

namespace HwProj.CoursesService.API.Services
{
    public interface IDeadlinesService
    {
        Task<long?> AddDeadlineAsync(long taskId, Deadline deadline);
        Task DeleteDeadline(long deadlineId);
        Task<Deadline[]> GetAllDeadlinesAsync();
        Task<Deadline[]> GetTaskDeadlinesAsync(long taskId);
    }
}
