using HwProj.Models.AuthService.DTO;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HwProj.CoursesService.API.Services;

public interface ICourseTokenService
{
    Result<TokenCredentials> GetToken(long courseId);
}

public class CourseTokenService : ICourseTokenService
{
    private readonly IConfigurationSection _configuration;

    public CourseTokenService(IConfiguration configuration)
    {
        _configuration = configuration.GetSection("AppSettings");
    }
    
    public Result<TokenCredentials> GetToken(long courseId)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_configuration["SecurityKey"]));
        var timeNow = DateTime.UtcNow;
        
        var token = new JwtSecurityToken(
            issuer: _configuration["ApiName"],
            notBefore: timeNow,
            expires: timeNow.AddMinutes(int.Parse(_configuration["ExpiresIn"])),
            claims: new[]
            {
                new Claim("_course_Id", courseId.ToString()),
                new Claim(ClaimTypes.Role, Roles.WorkflowRole)
            },
            signingCredentials: new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256));

        var tokenCredentials = new TokenCredentials
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token)
        };

        return Result<TokenCredentials>.Success(tokenCredentials);
    }
}