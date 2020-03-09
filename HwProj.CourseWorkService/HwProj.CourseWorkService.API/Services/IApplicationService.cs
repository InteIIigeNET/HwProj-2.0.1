using HwProj.CourseWorkService.API.Models;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public interface IApplicationService : IEntityService<Application>
    {
        Task<Application[]> GetLecturerApplicationsAsync(long lecturerId);
        Task DeleteApplicationAsync(long studentId, long courseWorkId); 
    }
}
