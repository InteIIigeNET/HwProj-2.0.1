using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using System.Threading.Tasks;

namespace HwProj.AuthService.API.Services
{
    public interface IAuthTokenService
    {
        Task<TokenCredentials> GetTokenAsync(User user);
    }
}
