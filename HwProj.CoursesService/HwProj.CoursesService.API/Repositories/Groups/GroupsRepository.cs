using HwProj.Repositories;
using HwProj.CoursesService.API.Models;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HwProj.CoursesService.API.Repositories
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
