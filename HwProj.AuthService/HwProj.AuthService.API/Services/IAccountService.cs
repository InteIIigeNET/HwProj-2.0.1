using System.Threading.Tasks;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Services
{
    public interface IAccountService
    {
        Task<AccountDataDto> GetAccountDataAsync(string userId);
        Task<IdentityResult> RegisterUserAsync(RegisterViewModel model);
        Task<IdentityResult> EditAccountAsync(string accountId, EditAccountViewModel model);
        Task<IdentityResult<TokenCredentials>> LoginUserAsync(LoginViewModel model);
        Task<IdentityResult> InviteNewLecturer(string emailOfInvitedUser);
    }
}