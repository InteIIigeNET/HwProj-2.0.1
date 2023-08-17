using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IAssignmentsRepository : ICrudRepository<Assignment, long>
    {
        Task<Assignment[]> GetAllByCourseAsync(long courseId);
    }
}
