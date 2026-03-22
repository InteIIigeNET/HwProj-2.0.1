using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Repositories.Groups
{
    public interface IGroupsRepository : ICrudRepository<Group, long>
    {
        Task<Group[]> GetGroupsWithGroupMatesAsync(long[] ids);
        IQueryable<Group> GetGroupsWithGroupMatesByCourse(long courseId);
    }
}
