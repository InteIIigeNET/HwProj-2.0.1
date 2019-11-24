using HwProj.CourseWorkService.API.Models;
using HwProj.Repositories;

namespace HwProj.CourseWorkService.API.Repositories
{
    public class ApplicationsRepository : CrudRepository<Application>, IApplicationsRepository
    {
        public ApplicationsRepository(CourseWorkContext context)
            : base(context)
        {
        }
    }
}
