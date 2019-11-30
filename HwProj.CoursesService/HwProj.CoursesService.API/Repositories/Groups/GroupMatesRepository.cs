using HwProj.Repositories;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Repositories
{
    public class GroupMatesRepository : CrudRepository<GroupMate>, IGroupMatesRepository
    {
        public GroupMatesRepository(CourseContext context)
            : base(context)
        {
        }
    }
}
