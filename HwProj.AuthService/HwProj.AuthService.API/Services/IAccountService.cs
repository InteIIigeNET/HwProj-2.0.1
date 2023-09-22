using System.Collections.Generic;
using System.Threading.Tasks;

using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;

namespace HwProj.AuthService.API.Services
{
    public interface IAccountService
    {
        Task<AccountDataDto> GetAccountDataAsync(string userId);
        Task<Result<TokenCredentials>> RegisterUserAsync(RegisterDataDTO model);
        Task<Result> EditAccountAsync(string accountId, EditDataDTO model);
        Task<Result<TokenCredentials>> LoginUserAsync(LoginViewModel model);
        Task<Result> InviteNewLecturer(string emailOfInvitedUser);
        Task<IList<User>> GetUsersInRole(string role);
        Task<Result> RequestPasswordRecovery(RequestPasswordRecoveryViewModel model);
        Task<Result> ResetPassword(ResetPasswordViewModel model);
    }
}
