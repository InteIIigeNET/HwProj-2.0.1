using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;

namespace HwProj.CourseWorkService.API.Services.Interfaces
{
    public interface IApplicationsService
    {
        Task<long> AddApplicationAsync(string userId, long courseWorkId,
            CreateApplicationViewModel createApplicationViewModel);
        Task<OverviewApplicationDTO[]> GetFilteredApplicationsAsync(Expression<Func<Application, bool>> predicate);
        Task<StudentApplicationDTO> GetApplicationForStudentAsync(string userId, long appId);
        Task<LecturerApplicationDTO> GetApplicationForLecturerAsync(string userId, long appId);
        Task CancelApplicationAsync(string userId, long appId);
        Task RejectApplicationAsync(string userId, long appId);
        Task AcceptStudentApplicationAsync(string userId, long appId);
    }
}
