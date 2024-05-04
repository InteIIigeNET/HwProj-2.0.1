using System;
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

namespace HwProj.AuthService.API.Services
{
    public class AuthTokenService : IAuthTokenService
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfigurationSection _configuration;
        private readonly JwtSecurityTokenHandler _tokenHandler;

        public AuthTokenService(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration.GetSection("AppSettings");
            _tokenHandler = new JwtSecurityTokenHandler();
        }

        public async Task<TokenCredentials> GetTokenAsync(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_configuration["SecurityKey"]));
            var timeNow = DateTime.UtcNow;

            var userRoles = await _userManager.GetRolesAsync(user).ConfigureAwait(false);

            var expiresIn = userRoles.FirstOrDefault() == Roles.ExpertRole
                ? GetExpertExpiresIn(timeNow)
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

        public Task<TokenCredentials> GetExpertTokenAsync()
        {
            throw new NotImplementedException();
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

        private DateTime GetExpertExpiresIn(DateTime timeNow)
        {
            var expertOptions = _configuration.GetSection("ExpertOptions");
            var firstTermDate = DateTime.ParseExact(expertOptions["ExpiresFirstTerm"],
                expertOptions["ExpiresFormat"], CultureInfo.InvariantCulture);
            var secondTermDate = DateTime.ParseExact(expertOptions["ExpiresSecondTerm"],
                expertOptions["ExpiresFormat"], CultureInfo.InvariantCulture);
            if (timeNow < firstTermDate) return firstTermDate;
            if (timeNow >= firstTermDate && timeNow < secondTermDate) return secondTermDate;
            return firstTermDate.AddYears(1);
        }
    }
}
