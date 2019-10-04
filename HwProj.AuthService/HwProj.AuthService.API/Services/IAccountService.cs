using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models.ViewModels;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.Models.DTO;
using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Services
{
    public interface IAccountService
    {
        Task<AccountData> GetAccountDataAsync(string userId);
        Task<IdentityResult> RegisterUserAsync(RegisterViewModel model);
        Task<IdentityResult> EditAccountAsync(string accountId, EditAccountViewModel model);
        Task<IdentityResult<TokenCredentials>> LoginUserAsync(LoginViewModel model);
        Task<IdentityResult> InviteNewLecturer(string emailOfInvitedUser);
    }
}