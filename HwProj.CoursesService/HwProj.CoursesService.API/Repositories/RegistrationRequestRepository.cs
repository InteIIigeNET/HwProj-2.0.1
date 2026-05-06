using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories.Net8;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class RegistrationRequestsRepository : CrudRepository<RegistrationRequest, long>, IRegistrationRequestsRepository 
    {
        public RegistrationRequestsRepository(CourseContext context)
            : base(context)
        {
        }
        
        public async Task<RegistrationRequest?> GetPendingByEmailAsync(string email)
        {
            return await Context.Set<RegistrationRequest>()
                .FirstOrDefaultAsync(r => 
                    r.Email == email &&
                    r.Status == RegistrationRequestStatus.Pending);
        }
    }
}