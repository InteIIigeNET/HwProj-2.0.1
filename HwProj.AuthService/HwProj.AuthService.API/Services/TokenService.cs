using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.Models.DTO;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.AuthService.API.Services
{
	public class AuthTokenService : IAuthTokenService
	{
		private readonly IConfigurationSection _configuration;
		private readonly UserManager<User> _userManager;

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
				_configuration["ApiName"],
				notBefore: timeNow,
				expires: timeNow.AddMinutes(int.Parse(_configuration["ExpireInForToken"])),
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
				ExpiresIn = (int) TimeSpan.FromMinutes(int.Parse(_configuration["ExpireInForResponse"])).TotalSeconds
			};

			return tokenCredentials;
		}
	}
}