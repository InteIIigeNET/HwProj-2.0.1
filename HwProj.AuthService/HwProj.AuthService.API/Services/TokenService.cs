using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using HwProj.Models.Roles;
using Microsoft.Extensions.Configuration;
using HwProj.Models.AuthService.DTO;
using HwProj.AuthService.API.Models;

namespace HwProj.AuthService.API.Services
{
    public class AuthTokenService : IAuthTokenService
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfigurationSection _configuration;

        public AuthTokenService(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration.GetSection("AppSettings");
        }

        public async Task<TokenCredentials> GetTokenAsync(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_configuration["SecurityKey"]));
            var timeNow = DateTime.UtcNow;

            var userRoles = await _userManager.GetRolesAsync(user).ConfigureAwait(false);

            var token = new JwtSecurityToken(
                issuer: _configuration["ApiName"],
                notBefore: timeNow,
                expires: timeNow.AddMinutes(int.Parse(_configuration["ExpireInForToken"])),
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
                AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
                ExpiresIn = (int) TimeSpan.FromMinutes(int.Parse(_configuration["ExpireInForResponse"])).TotalSeconds
            };

            return tokenCredentials;
        }
    }
}
