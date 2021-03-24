using HwProj.Repositories;
using HwProj.CoursesService.API.Models;

namespace HwProj.CoursesService.API.Repositories.Groups
{
    public class GroupMatesRepository : CrudRepository<GroupMate, long>, IGroupMatesRepository
    {
        public GroupMatesRepository(CourseContext context)
            : base(context)
        {
        }
    }
}
