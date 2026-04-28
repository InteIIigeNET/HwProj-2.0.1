using HwProj.CoursesService.API.Models;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Repositories
{
    public class RegistrationRequestRepository : CrudRepository<RegistrationRequest, long>, IRegistrationRequestRepository 
    {
        public RegistrationRequestRepository(CourseContext context)
            : base(context)
        {
        }
    }
}