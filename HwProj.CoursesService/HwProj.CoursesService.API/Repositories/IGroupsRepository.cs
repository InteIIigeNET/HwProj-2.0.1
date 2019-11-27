using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IGroupsRepository : ICrudRepository<Group>
    {
        Task<Group> GetGroupWithCourseMatesAsync(long id);
        IQueryable<Group> GetAllWithCourseMates(long courseId);
    }
}
