using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IGroupsRepository : ICrudRepository<Group>
    {
        Task<Group> GetGroupWithGroupMatesAsync(long id);
        IQueryable<Group> GetAllInCourseWithGroupMates(long courseId);
    }
}
