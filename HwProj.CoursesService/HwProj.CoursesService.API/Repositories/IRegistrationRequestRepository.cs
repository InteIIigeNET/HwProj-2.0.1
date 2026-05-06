using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IRegistrationRequestsRepository : ICrudRepository<RegistrationRequest, long>
    {
        Task<RegistrationRequest?> GetPendingByEmailAsync(string email);
    }
}