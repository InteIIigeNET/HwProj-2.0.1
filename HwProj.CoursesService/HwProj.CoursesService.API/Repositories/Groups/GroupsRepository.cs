using System.Linq;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories.Groups
{
    public class GroupsRepository : CrudRepository<Group, long>, IGroupsRepository
    {
        public GroupsRepository(CourseContext context)
            : base(context)
        {
        }

        public async Task<Group> GetGroupWithGroupMatesAsync(long id)
        {
            return await Context.Set<Group>().Include(c => c.GroupMates)
                .AsNoTracking()
                .Include(c => c.Tasks)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id)
                .ConfigureAwait(false);
        }

        public IQueryable<Group> GetGroupsWithGroupMatesByCourse(long courseId)
        {
            return Context.Set<Group>()
                .Where(c => c.CourseId == courseId)
                .Include(c => c.GroupMates)
                .AsNoTracking()
                .Include(c => c.Tasks)
                .AsNoTracking();
        }
    }
}
