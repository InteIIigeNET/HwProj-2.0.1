using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace HwProj.AuthService.Client
{
    public interface IAuthServiceClient
    {
        Task<AccountDataDto> GetAccountData(string accountId);
        
        Task<Result> Register(RegisterViewModel model);

        Task<TokenCredentials> Login(LoginViewModel model);
    }
}
