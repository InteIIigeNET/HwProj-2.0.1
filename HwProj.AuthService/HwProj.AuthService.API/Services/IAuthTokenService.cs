using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using System;
using System.Threading.Tasks;
using HwProj.Models.Result;

namespace HwProj.AuthService.API.Services
{
    public interface IAuthTokenService
    {
        Task<TokenCredentials> GetTokenAsync(User user, DateTime? expirationDate = null);
        Task<Result<TokenCredentials>> GetExpertTokenAsync(User expert);
        TokenClaims GetTokenClaims(TokenCredentials tokenCredentials);
    }
}