using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace HwProj.AuthService.API.Services
{
    public class TokenService
    {
        private readonly UserManager<User> userManager;
        private readonly AppSettings appSettings;

        public TokenService(UserManager<User> userManager, IOptions<AppSettings> appSettings)
        {
            this.userManager = userManager;
            this.appSettings = appSettings.Value;
        }

        /// <summary>
        /// Генерация токена для пользователя
        /// </summary>
        public async Task<List<object>> GetToken(User user)
        {
            const int expireInForToken = 300;
            const int expireInForResponse = 30;

            var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(appSettings.SecurityKey));
            var timeNow = DateTime.UtcNow;

            var token = new JwtSecurityToken(
                    issuer: appSettings.ApiName,
                    notBefore: timeNow,
                    expires: timeNow.Add(TimeSpan.FromMinutes(expireInForToken)),
                    claims: new[]
                    {
                        new Claim("_surname", user.Surname),
                        new Claim("_name", user.Name),
                        new Claim("_id", user.Id),
                        new Claim("_email", user.Email),
                        new Claim("_role", (await userManager.GetRolesAsync(user))[0])
                    },
                    signingCredentials:
                        new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256));

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
            var expiresIn = (int)TimeSpan.FromMinutes(expireInForResponse).TotalSeconds;

            return new List<object> { accessToken, expiresIn };
        }
    }
}