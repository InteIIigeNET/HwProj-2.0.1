using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories
{
    public interface IDeadlineRepository : ICrudRepository<Deadline, long>
    {
        Task<Deadline> GetDeadlineAsync(long id);
    }
}
