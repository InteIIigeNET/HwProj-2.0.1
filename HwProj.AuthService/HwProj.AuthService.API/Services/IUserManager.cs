using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.Models.AuthService.ViewModels;
using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Services
{
    public interface IUserManager
    {
        Task<IdentityResult> CreateAsync(UserViewModel userViewModel);
        Task<IdentityResult> CreateAsync(UserViewModel userViewModel, string password);
        Task<UserViewModel> FindByIdAsync(string id);
        Task<UserViewModel> FindByEmailAsync(string email);
        Task<IdentityResult> UpdateAsync(UserViewModel userViewModel);
        Task<IdentityResult> AddToRoleAsync(UserViewModel userViewModel, string role);
        Task<IdentityResult> RemoveFromRoleAsync(UserViewModel userViewModel, string role);
        Task<IList<string>> GetRolesAsync(UserViewModel userViewModel);
        Task<bool> IsEmailConfirmedAsync(UserViewModel userViewModel);
        Task<bool> CheckPasswordAsync(UserViewModel userViewModel, string password);
        Task<IdentityResult> ChangePasswordAsync(UserViewModel userViewModel, string currentPassword, string newPassword);
        Task<IList<UserViewModel>> GetUsersInRoleAsync(string role);
    }
}
