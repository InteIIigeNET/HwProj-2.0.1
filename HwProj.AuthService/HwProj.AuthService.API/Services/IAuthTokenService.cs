using System.Threading.Tasks;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.Models.DTO;

namespace HwProj.AuthService.API.Services
{
    public interface IAuthTokenService
    {
        Task<TokenCredentials> GetTokenAsync(User user);
    }
}