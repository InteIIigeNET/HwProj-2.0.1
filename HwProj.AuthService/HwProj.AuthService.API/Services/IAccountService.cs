using System.Threading.Tasks;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Services
{
    public interface IAccountService
    {
        Task<AccountDataDto> GetAccountDataAsync(string userId);
        Task<Result<TokenCredentials>> RegisterUserAsync(RegisterViewModel model);
        Task<Result> EditAccountAsync(string accountId, EditAccountViewModel model);
        Task<Result<TokenCredentials>> LoginUserAsync(LoginViewModel model);
        Task<Result> InviteNewLecturer(string emailOfInvitedUser);
    }
}