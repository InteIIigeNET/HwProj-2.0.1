using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IDeadlinesRepository : ICrudRepository<Deadline, long>
    {
    }
}
