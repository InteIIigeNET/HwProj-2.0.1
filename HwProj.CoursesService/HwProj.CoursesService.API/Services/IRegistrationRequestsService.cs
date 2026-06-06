using System.Threading.Tasks;
using HwProj.Models.CoursesService.DTO;
using HwProj.Models.CoursesService.ViewModels;
using HwProj.Models.Result;

namespace HwProj.CoursesService.API.Services
{
    public interface IRegistrationRequestsService
    {
        Task<Result> InitRequestAsync(InitRegistrationRequestViewModel model);
        Task<Result<long>> ConfirmRequestAsync(string token);
        
        Task<Result<RegistrationRequestDto[]>> GetCourseRequestsAsync(long courseId, string reviewerId);
        Task<Result<RegistrationRequestDto[]>> GetGeneralRequestsAsync(string reviewerId);

        Task<Result<string>> ApproveAsync(long requestId, string reviewerId);
        Task<Result> RejectAsync(long requestId, string reviewerId, string? rejectReason);
    }
}