using System.Linq;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models;
using HwProj.Repositories.Net8;
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
                .Where(data => data.LecturerId == lecturerId)
                .Include(expertData => expertData.User)
                .AsNoTracking()
                .ToArrayAsync()
                .ConfigureAwait(false);
        }

        public async Task<ExpertData[]> GetAllWithUserInfoAsync()
        {
            return await Context.Set<ExpertData>()
                .Include(expertData => expertData.User)
                .AsNoTracking()
                .ToArrayAsync();
        }

        public async Task<ExpertData> GetWithUserInfoAsync(string expertId)
        {
            return await Context.Set<ExpertData>()
                .Include(expertData => expertData.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(expertData => expertData.Id == expertId);
        }
    }
}