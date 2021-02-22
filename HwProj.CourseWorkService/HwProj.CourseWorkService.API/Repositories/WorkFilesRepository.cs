using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories
{
    public class WorkFilesRepository : CrudRepository<WorkFile>, IWorkFilesRepository
    {
        public WorkFilesRepository(CourseWorkContext context) : base(context)
        {
        }
    }
}
