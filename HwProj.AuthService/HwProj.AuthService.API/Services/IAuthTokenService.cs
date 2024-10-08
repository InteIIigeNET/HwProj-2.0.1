﻿using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using System.Threading.Tasks;
using HwProj.Models.Result;

namespace HwProj.AuthService.API.Services
{
    public interface IAuthTokenService
    {
        Task<TokenCredentials> GetTokenAsync(User user);
        Task<Result<TokenCredentials>> GetExpertTokenAsync(User expert);
        TokenClaims GetTokenClaims(TokenCredentials tokenCredentials);
    }
}
