using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;

namespace HwProj.CourseWorkService.API.Services
{
    public class WorkFilesService : EntityService<WorkFile>, IWorkFilesService
    {
        public WorkFilesService(IWorkFilesRepository workFilesRepository) : base(workFilesRepository)
        {
        }
    }
}
