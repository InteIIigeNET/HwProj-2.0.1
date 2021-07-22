using System.Threading.Tasks;
using HwProj.AuthService.API.Models.DTO;
using HwProj.AuthService.API.Models.ViewModels;
using HwProj.Models.AuthService;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.AuthService.Client
{
    public interface IAuthServiceClient
    {
        Task<AccountDataDto> GetAccountData(string accountId);
        
        Task<IActionResult> Register(RegisterViewModel model);

        Task<IActionResult> Login(LoginViewModel model);
    }
}
