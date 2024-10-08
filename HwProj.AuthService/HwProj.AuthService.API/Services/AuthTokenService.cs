﻿using System;
using System.Globalization;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using HwProj.Models.Roles;
using Microsoft.Extensions.Configuration;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;

namespace HwProj.AuthService.API.Services
{
    public class AuthTokenService : IAuthTokenService
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfigurationSection _configuration;
        private readonly IConfigurationSection _expertConfiguration;
        private readonly JwtSecurityTokenHandler _tokenHandler;

        public AuthTokenService(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration.GetSection("AppSettings");
            _expertConfiguration = configuration.GetSection("ExpertOptions");
            _tokenHandler = new JwtSecurityTokenHandler();
        }

        public async Task<TokenCredentials> GetTokenAsync(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_configuration["SecurityKey"]));
            var timeNow = DateTime.UtcNow;

            var userRoles = await _userManager.GetRolesAsync(user).ConfigureAwait(false);

            var expiresIn = userRoles.FirstOrDefault() == Roles.ExpertRole
                ? GetExpertTokenExpiresIn(timeNow)
                : timeNow.AddMinutes(int.Parse(_configuration["ExpiresIn"]));
            
            var token = new JwtSecurityToken(
                issuer: _configuration["ApiName"],
                notBefore: timeNow,
                expires: expiresIn,
                claims: new[]
                {
                    new Claim("_userName", user.UserName),
                    new Claim("_id", user.Id),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, userRoles.FirstOrDefault() ?? Roles.StudentRole)
                },
                signingCredentials: new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256));

            var tokenCredentials = new TokenCredentials
            {
                AccessToken = _tokenHandler.WriteToken(token)
            };

            return tokenCredentials;
        }

        public async Task<Result<TokenCredentials>> GetExpertTokenAsync(User expert)
        {
            var loginProvider = _expertConfiguration["LoginProvider"];
            var tokenName = _expertConfiguration["TokenName"];
            var token = await _userManager.GetAuthenticationTokenAsync(expert, loginProvider,
                tokenName);

            if (token is null || _tokenHandler.ReadJwtToken(token).ValidTo <= DateTime.UtcNow)
            {
                if (token != null)
                {
                    var deletionResult = await _userManager.RemoveAuthenticationTokenAsync(expert, loginProvider,
                        tokenName);
                    if (!deletionResult.Succeeded)
                        return Result<TokenCredentials>.Failed(deletionResult.Errors
                            .Select(errors => errors.Description)
                            .ToArray());
                }
                
                var tokenCredentials = await GetTokenAsync(expert);
                var result = await _userManager.SetAuthenticationTokenAsync(expert, loginProvider,
                    tokenName, tokenCredentials.AccessToken);
                if (result.Succeeded) return Result<TokenCredentials>.Success(tokenCredentials);
                
                return Result<TokenCredentials>.Failed(result.Errors.Select(errors => errors.Description)
                    .ToArray());
            }
            
            return Result<TokenCredentials>.Success(new TokenCredentials
            {
                AccessToken = token
            });
        }

        public TokenClaims GetTokenClaims(TokenCredentials tokenCredentials)
        {
            var tokenClaims = _tokenHandler.ReadJwtToken(tokenCredentials.AccessToken).Claims.ToList();
            return new TokenClaims()
            {
                Email = tokenClaims.FirstOrDefault(claim => claim.Type == ClaimTypes.Email)?.Value,
                Id = tokenClaims.FirstOrDefault(claim => claim.Type == "_id")?.Value,
                Role = tokenClaims.FirstOrDefault(claim => claim.Type == ClaimTypes.Role)?.Value,
                UserName = tokenClaims.FirstOrDefault(claim => claim.Type == "_userName")?.Value
            };
        }

        // Дата истечения токена ——— ближайшая дата завершения семестра (первого или второго).
        // Если сейчас находимся дальше конца второго семестра, то попадаем в первый семестр, и
        // дата истечения токена --- дата завершения первого семестра в следующем году.
        private DateTime GetExpertTokenExpiresIn(DateTime timeNow)
        {
            var expiresFormat = _expertConfiguration["ExpiresFormat"];
            var firstTermDate = DateTime.ParseExact(_expertConfiguration["ExpiresFirstTerm"],
                expiresFormat, CultureInfo.InvariantCulture);
            var secondTermDate = DateTime.ParseExact(_expertConfiguration["ExpiresSecondTerm"],
                expiresFormat, CultureInfo.InvariantCulture);

            if (timeNow < firstTermDate) return firstTermDate;
            if (timeNow >= firstTermDate && timeNow < secondTermDate) return secondTermDate;
            return firstTermDate.AddYears(1);
        }
    }
}
