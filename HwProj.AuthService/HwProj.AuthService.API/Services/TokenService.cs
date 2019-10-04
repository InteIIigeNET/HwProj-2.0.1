using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models.DTO;
using HwProj.Models.Roles;

namespace HwProj.AuthService.API.Services
{
    public class AuthTokenService : IAuthTokenService
    {
        private readonly UserManager<User> _userManager;
        private readonly AppSettings _appSettings;

        public AuthTokenService(UserManager<User> userManager,
            IOptions<AppSettings> appSettings)
        {
            _userManager = userManager;
            _appSettings = appSettings.Value;
        }

        public async Task<TokenCredentials> GetTokenAsync(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_appSettings.SecurityKey));
            var timeNow = DateTime.UtcNow;

            var userRoles = await _userManager.GetRolesAsync(user).ConfigureAwait(false);

            var token = new JwtSecurityToken(
                issuer: _appSettings.ApiName,
                notBefore: timeNow,
                expires: timeNow.AddMinutes(_appSettings.ExpireInForToken),
                claims: new[]
                {
                    new Claim("_userName", user.UserName),
                    new Claim("_id", user.Id),
                    new Claim("_email", user.Email),
                    new Claim("_role", userRoles.FirstOrDefault() ?? Roles.StudentRole)
                },
                signingCredentials: new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256));

            var tokenCredentials = new TokenCredentials
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
                ExpiresIn = (int) TimeSpan.FromMinutes(_appSettings.ExpireInForResponse).TotalSeconds
            };

            return tokenCredentials;
        }
    }
}