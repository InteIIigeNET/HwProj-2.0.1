using System;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Models;
using HwProj.Repositories.Net8;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CoursesService.API.Repositories
{
    public class RegistrationRequestDraftsRepository : CrudRepository<RegistrationRequestDraft, long>,
        IRegistrationRequestDraftsRepository
    {
        public RegistrationRequestDraftsRepository(CourseContext context)
            : base(context)
        {
        }

        public async Task<RegistrationRequestDraft?> GetUnconfirmedByEmailAsync(string email)
        {
            return await Context.Set<RegistrationRequestDraft>()
                .FirstOrDefaultAsync(r =>
                    r.Email == email &&
                    !r.IsConfirmed);
        }

        public async Task<RegistrationRequestDraft?> GetByTokenAsync(string token)
        {
            return await Context.Set<RegistrationRequestDraft>()
                .FirstOrDefaultAsync(r => r.ConfirmationToken == token);
        }
    }
}
