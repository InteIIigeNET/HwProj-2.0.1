using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IDeadlinesRepository : ICrudRepository<Deadline, long>
    {
        Task<long> AddDeadlineAsync(Deadline deadline);
        Task<bool> CheckIfDeadlineExistsAsync(Deadline deadline);

        Task<List<Deadline>> GetTaskDeadlinesForStudent(string studentId, long taskId);
    }
}
