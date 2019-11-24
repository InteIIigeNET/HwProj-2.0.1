using HwProj.Repositories;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Repositories
{
    public class GroupsRepository : CrudRepository<Group>, IGroupsRepository
    {
        public GroupsRepository(CourseContext context)
            : base(context)
        {
        }
    }
}
