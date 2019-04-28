using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System;
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

        public async Task<string> GetToken(User user)
        {
            const int expireInForTOken = 40;
            const int expireInForResponse = 30;

            var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(appSettings.SecurityKey));
            var timeNow = DateTime.UtcNow;

            var token = new JwtSecurityToken(
                    issuer: "AuthService",
                    notBefore: timeNow,
                    expires: timeNow.Add(TimeSpan.FromMinutes(expireInForTOken)),
                    claims: new[]
                    {
                        new Claim("_surname", user.Surname),
                        new Claim("_name", user.Name),
                        new Claim("_id", user.Id),
                        new Claim("_email", user.Email),
                        new Claim(ClaimsIdentity.DefaultRoleClaimType, (await userManager.GetRolesAsync(user))[0])
                    },
                    signingCredentials:
                        new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256));

            var response = new
            {
                accessToken = new JwtSecurityTokenHandler().WriteToken(token),
                expiresIn = (int)TimeSpan.FromMinutes(expireInForResponse).TotalSeconds
            };

            return JsonConvert.SerializeObject(response);
        }
    }
}