using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;

namespace HwProj.CoursesService.API.Repositories.Groups
{
    public interface IGroupsRepository : ICrudRepository<Group, long>
    {
        Task<Group> GetGroupWithGroupMatesAsync(long id);
        IQueryable<Group> GetGroupsWithGroupMatesByCourse(long courseId);
    }
}
