using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.CourseWorkService.API.Repositories.Implementations
{
    public class WorkFilesRepository : CrudRepository<WorkFile, long>, IWorkFilesRepository
    {
        public WorkFilesRepository(CourseWorkContext context) : base(context)
        {
        }

        public async Task<WorkFile> GetWorkFileAsync(long id)
        {
            return await Context.Set<WorkFile>()
                .Include(wf => wf.CourseWork)
                .FirstOrDefaultAsync(wf => wf.Id == id);
        }
    }
}
