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
        public ExpertsRepository(IdentityContext context)
            : base(context)
        {
        }

        public async Task<ExpertData[]> GetExpertsData(string lecturerId)
        {
            return await Context.Set<ExpertData>()
                .AsNoTracking()
                .Where(data => data.LecturerId == lecturerId)
                .ToArrayAsync()
                .ConfigureAwait(false);
        }
    }
}