using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories.Net8;

namespace HwProj.CoursesService.API.Repositories
{
    public interface IRegistrationRequestDraftsRepository : ICrudRepository<RegistrationRequestDraft, long>
    {
        Task<RegistrationRequestDraft?> GetUnconfirmedByEmailAsync(string email);

        Task<RegistrationRequestDraft?> GetByTokenAsync(string token);
    }
}
