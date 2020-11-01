using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Repositories
{
    public class ApplicationsRepository : CrudRepository<Application, long>, IApplicationsRepository
    {
        public ApplicationsRepository(CourseWorkContext context)
            : base(context)
        {
        }

        public async Task<Application> GetApplicationAsync(long id)
        {
            return await Context.Set<Application>().Include(a => a.CourseWork)
               .Include(a => a.StudentProfile)
               .ThenInclude(sp => sp.User)
              .FirstOrDefaultAsync(a => a.Id == id);
        }
    }
}
