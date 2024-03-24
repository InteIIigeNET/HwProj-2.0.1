using HwProj.Models.AuthService.DTO;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace HwProj.CoursesService.API.Services;

public interface ICourseTokenService
{
    TokenCredentials GetToken();
}

public class CourseTokenService : ICourseTokenService
{
    private readonly IConfigurationSection _configuration;

    public CourseTokenService(IConfiguration configuration)
    {
        _configuration = configuration.GetSection("AppSettings");
    }
    
    public TokenCredentials GetToken()
    {
        var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_configuration["SecurityKey"]));
        var timeNow = DateTime.UtcNow;
        
        var token = new JwtSecurityToken(
            issuer: _configuration["ApiName"],
            notBefore: timeNow,
            expires: timeNow.AddMinutes(int.Parse(_configuration["ExpiresIn"])),
            signingCredentials: new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256));

        var tokenCredentials = new TokenCredentials
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token)
        };

        return tokenCredentials;
    }
}