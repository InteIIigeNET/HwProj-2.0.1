using System;
using System.Linq.Expressions;
using HwProj.CourseWorkService.API.Models;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Services
{
    public interface IApplicationService
    {
        Task<Application> GetApplicationAsync(long applicationId);

        Task<Application[]> GetAllApplicationsAsync();

        Task<Application[]> GetFilteredApplicationsAsync(Expression<Func<Application, bool>> predicate);

        Task<Application[]> GetLecturerApplicationsAsync(long lecturerId);

        Task<long> AddApplicationAsync(Application application);

        Task DeleteApplicationAsync(long studentId, long courseWorkId); 
    }
}
