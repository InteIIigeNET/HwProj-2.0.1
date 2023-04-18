using System.Collections.Generic;
using System.Threading.Tasks;
using Google.Apis.Auth;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;

namespace HwProj.AuthService.API.Services;

public interface IAccountService
{
    Task<AccountDataDto> GetAccountDataAsync(string userId);
    Task<AccountDataDto[]> GetManyAccountDataAsync(string[] userIds);
    Task<Result<TokenCredentials>> RegisterUserAsync(RegisterDataDTO model);
    Task<Result> EditAccountAsync(string accountId, EditDataDTO model);
    Task<Result<TokenCredentials>> LoginUserAsync(LoginViewModel model);
    Task<Result<TokenCredentials>> LoginUserByGoogleAsync(GoogleJsonWebSignature.Payload payload);
    Task<Result> InviteNewLecturerAsync(string emailOfInvitedUser);
    Task<IList<User>> GetUsersInRoleAsync(string role);
}