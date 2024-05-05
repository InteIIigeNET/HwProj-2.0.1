using System.Linq;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HwProj.AuthService.API.Repositories
{
    public class ExpertsRepository : CrudRepository<ExpertData, string>, IExpertsRepository
    {
        public ExpertsRepository(IdentityContext context, UserManager<User> aspUserManager)
            : base(context)
        {
        }

        public async Task<string[]> GetExpertIdsByLecturerId(string lecturerId)
        {
            return await Context.Set<ExpertData>()
                .AsNoTracking()
                .Where(data => data.LecturerId == lecturerId)
                .Select(data => data.Id)
                .ToArrayAsync()
                .ConfigureAwait(false);
        }

        public async Task<string[]> GetAllExpertIds()
        {
            return await Context.Set<ExpertData>()
                .AsNoTracking()
                .Select(data => data.Id)
                .ToArrayAsync()
                .ConfigureAwait(false);
        }

        public async Task<string?> GetExpertAccessToken(string expertId)
        {
            return "a";
            // return await Context.Set<ExpertData>()
            //     .AsNoTracking()
            //     .Where(data => data.Id == expertId)
            //     .Select(data => data.AccessToken)
            //     .FirstOrDefaultAsync();
        }
    }
}