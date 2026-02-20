using HwProj.Models.AuthService.DTO;
using System.Threading.Tasks;
using HwProj.Models.Result;
using User = HwProj.AuthService.API.Models.User;

namespace HwProj.AuthService.API.Services
{
    public interface IAuthTokenService
    {
        Task<TokenCredentials> GetTokenAsync(User user);
        Task<Result<TokenCredentials>> GetExpertTokenAsync(User expert);
        TokenClaims GetTokenClaims(TokenCredentials tokenCredentials);
    }
}
