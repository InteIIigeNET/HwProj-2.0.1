using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using System.Threading.Tasks;
using HwProj.Models.Result;
using HwProj.Models.AuthService;
using HwProj.Models.CoursesService.DTO;

namespace HwProj.AuthService.Client
{
    public interface IAuthServiceClient
    {
        Task<AccountDataDto> GetAccountData(string accountId);
        Task<Result<TokenCredentials>> Register(RegisterViewModel model);
        Task<Result<TokenCredentials>> Login(LoginViewModel model);
        Task<Result> Edit(EditAccountViewModel model, string userId);
        Task<Result> InviteNewLecturer(InviteLecturerViewModel model);
        Task<Result<TokenCredentials>> LoginByGoogle(string tokenId);
        Task<Result> EditExternal(EditExternalViewModel model, string userId);
        Task<GroupMateDataDTO[]> GetStudentData(StudentsModel studentsModel);
    }
}
