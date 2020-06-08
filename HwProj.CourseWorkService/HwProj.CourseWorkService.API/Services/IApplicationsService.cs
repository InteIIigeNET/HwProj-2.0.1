using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;

namespace HwProj.CourseWorkService.API.Services
{
    public interface IApplicationsService
    {
        Task<OverviewApplicationDTO[]> GetFilteredApplicationsAsync(Expression<Func<Application, bool>> predicate);
        LecturerApplicationDTO GetLecturerApplication(Application application);
        StudentApplicationDTO GetStudentApplication(Application application);
        Task<long> AddApplicationAsync(CreateApplicationViewModel newApplication, string userId, CourseWork courseWork);
        Task AcceptStudentApplicationAsync(Application application);
    }
}
