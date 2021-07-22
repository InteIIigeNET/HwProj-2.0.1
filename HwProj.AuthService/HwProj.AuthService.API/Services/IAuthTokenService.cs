using HwProj.AuthService.API.Models;
using HwProj.Models.AuthService.DTO;
using System.Threading.Tasks;

namespace HwProj.AuthService.API.Services
{
    public interface IAuthTokenService
    {
        Task<TokenCredentials> GetTokenAsync(User user);
    }
}