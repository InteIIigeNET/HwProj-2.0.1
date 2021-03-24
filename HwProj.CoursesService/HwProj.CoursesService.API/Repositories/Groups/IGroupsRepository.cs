using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IGroupsRepository : ICrudRepository<Group, long>
    {
        Task<Group> GetGroupWithGroupMatesAsync(long id);
        IQueryable<Group> GetGroupsWithGroupMatesByCourse(long courseId);
    }
}
