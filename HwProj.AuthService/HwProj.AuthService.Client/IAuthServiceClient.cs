﻿using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using System.Threading.Tasks;
using HwProj.Models.Result;

namespace HwProj.AuthService.Client
{
    public interface IAuthServiceClient
    {
        Task<AccountDataDto> GetAccountData(string userId);
        Task<AccountDataDto> GetAccountDataByEmail(string email);
        Task<AccountDataDto[]> GetAccountsData(string[] userId);
        Task<Result<TokenCredentials>> Register(RegisterViewModel model);
        Task<Result<TokenCredentials>> Login(LoginViewModel model);
        Task<Result<TokenCredentials>> RefreshToken(string userId);
        Task<Result> Edit(EditAccountViewModel model, string userId);
        Task<Result> InviteNewLecturer(InviteLecturerViewModel model);
        Task<Result> EditExternal(EditExternalViewModel model, string userId);
        Task<string> FindByEmailAsync(string email);
        Task<AccountDataDto[]> GetAllStudents();
        Task<User[]> GetAllLecturers();
        Task<bool> Ping();
        Task<Result> RequestPasswordRecovery(RequestPasswordRecoveryViewModel model);
        Task<Result> ResetPassword(ResetPasswordViewModel model);
    }
}
