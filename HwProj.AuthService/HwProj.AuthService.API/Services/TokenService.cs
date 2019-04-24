using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace HwProj.AuthService.API.Services
{
    public class TokenService
    {
        private readonly UserManager<User> userManager;

        public TokenService(UserManager<User> userManager)
            => this.userManager = userManager;

        public async Task<string> GetToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("Mkey12412rf12f1g12412e21f212g"));

            var token = new JwtSecurityToken(
                    issuer: "AuthSurvice",
                    notBefore: DateTime.UtcNow,
                    claims: new[]
                    {
                        new Claim("email", user.Email),
                        new Claim("role", (await userManager.GetRolesAsync(user))[0])
                    },
                    signingCredentials:
                        new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256));

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}