using HwProj.CoursesService.API.Models;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Repositories
{
    public class RegistrationRequestsRepository : CrudRepository<RegistrationRequest, long>, IRegistrationRequestsRepository 
    {
        public RegistrationRequestsRepository(CourseContext context)
            : base(context)
        {
        }
    }
}