using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories
{
    public class UsersRepository : CrudRepository<User>, IUsersRepository
    {
        public UsersRepository(CourseWorkContext context)
            : base(context)
        {
        }
    }
}
