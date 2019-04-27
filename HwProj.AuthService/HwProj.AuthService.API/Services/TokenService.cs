using HwProj.AuthService.API.Models;
using Microsoft.AspNetCore.Identity;
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

        public TokenService(UserManager<User> userManager)
            => this.userManager = userManager;

        public async Task<string> GetToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("Mkey12412rf12f1g12412e21f212g"));
            var timeNow = DateTime.UtcNow;

            var token = new JwtSecurityToken(
                    issuer: "AuthSurvice",
                    notBefore: timeNow,
                    expires: timeNow.Add(TimeSpan.FromMinutes(40)),
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
                expiresIn = (int)TimeSpan.FromMinutes(35).TotalSeconds
            };

            return JsonConvert.SerializeObject(response);
        }
    }
}