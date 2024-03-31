using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
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
using System.Threading.Tasks;

namespace HwProj.CoursesService.API.Services;

public interface ICourseTokenService
{
    Task<Result<TokenCredentials>> GetTokenAsync(long courseId);
}

public class CourseTokenService : ICourseTokenService
{
    private readonly IConfigurationSection _configuration;
    private readonly ICourseTokenRepository _courseTokenRepository;

    public CourseTokenService(IConfiguration configuration, ICourseTokenRepository courseTokenRepository)
    {
        _configuration = configuration.GetSection("AppSettings");
        _courseTokenRepository = courseTokenRepository;
    }
    
    public async Task<Result<TokenCredentials>> GetTokenAsync(long courseId)
    {
        var courseToken = await _courseTokenRepository.GetAsync(courseId);

        if (courseToken != null && courseToken.Expires > DateTime.UtcNow)
        {
            return Result<TokenCredentials>.Success(new TokenCredentials() { AccessToken = courseToken.Token });
        }

        await _courseTokenRepository.DeleteAsync(courseId);

        var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_configuration["SecurityKey"]));
        var expires = DateTime.Now.AddMinutes(int.Parse(_configuration["ExpiresIn"]));

        var token = new JwtSecurityToken(
            issuer: _configuration["ApiName"],
            notBefore: DateTime.Now,
            expires: expires,
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

        await _courseTokenRepository.AddAsync(new CourseToken() { CourseId = courseId, Token = tokenCredentials.AccessToken, Expires = expires });

        return Result<TokenCredentials>.Success(tokenCredentials);
    }
}