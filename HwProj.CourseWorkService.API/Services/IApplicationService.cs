using HwProj.CourseWorkService.API.Models;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public interface IApplicationService
    {
        Task<Application> GetApplicationAsync(long applicationId);

        Task<Application[]> GetAllApplicationsAsync();

        Task<Application[]> GetAllCourseWorkApplicationsAsync(long courseWorkId);

        Task<Application[]> GetAllSupervisorApplicationsAsync(string supervisorId);

        Task<Application[]> GetAllStudentApplicationsAsync(string studentId); 

        Task<long> AddApplicationAsync(Application application, string studentId, long courseWorkId);

        Task DeleteApplicationAsync(string studentId, long courseWorkId); 
    }
}
