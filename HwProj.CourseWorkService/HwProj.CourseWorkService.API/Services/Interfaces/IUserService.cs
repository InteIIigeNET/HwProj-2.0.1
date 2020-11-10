using System;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Models.ViewModels;

namespace HwProj.CourseWorkService.API.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserDTO[]> GetUsersByRoleAsync(RoleTypes role);
        Task UpdateStudentProfile(string userId, StudentProfileViewModel studentProfileViewModel);
    }
}
