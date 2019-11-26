using HwProj.Repositories;
using HwProj.CoursesService.API.Models;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class GroupsRepository : CrudRepository<Group>, IGroupsRepository
    {
        public GroupsRepository(CourseContext context)
            : base(context)
        {
        }

        public async Task<Group> GetGroupWithCourseMatesAsync(long id)
        {
            return await Context.Set<Group>().Include(c => c.GroupMates)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}
