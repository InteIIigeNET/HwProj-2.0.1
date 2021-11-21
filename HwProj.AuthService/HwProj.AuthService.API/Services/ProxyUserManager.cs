using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.Models.AuthService.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HwProj.AuthService.API.Services
{
    public class ProxyUserManager : IUserManager
    {
        private readonly UserManager<UserViewModel> _aspUserManager;

        public ProxyUserManager(UserManager<UserViewModel> aspUserManager)
        {
            _aspUserManager = aspUserManager;
        }
        
        public Task<IdentityResult> CreateAsync(UserViewModel userViewModel)
        {
            return _aspUserManager.CreateAsync(userViewModel);
        }

        public Task<IdentityResult> CreateAsync(UserViewModel userViewModel, string password)
        {
            return _aspUserManager.CreateAsync(userViewModel, password);
        }

        public Task<UserViewModel> FindByIdAsync(string id)
        {
            return _aspUserManager.FindByIdAsync(id);
        }

        public Task<UserViewModel> FindByEmailAsync(string email)
        {
            return _aspUserManager.FindByEmailAsync(email);
        }

        public Task<IdentityResult> UpdateAsync(UserViewModel userViewModel)
        {
            return _aspUserManager.UpdateAsync(userViewModel);
        }

        public Task<IdentityResult> AddToRoleAsync(UserViewModel userViewModel, string role)
        {
            return _aspUserManager.AddToRoleAsync(userViewModel, role);
        }

        public Task<IdentityResult> RemoveFromRoleAsync(UserViewModel userViewModel, string role)
        {
            return _aspUserManager.RemoveFromRoleAsync(userViewModel, role);
        }

        public Task<IList<string>> GetRolesAsync(UserViewModel userViewModel)
        {
            return _aspUserManager.GetRolesAsync(userViewModel);
        }

        public Task<bool> IsEmailConfirmedAsync(UserViewModel userViewModel)
        {
            return _aspUserManager.IsEmailConfirmedAsync(userViewModel);
        }

        public Task<bool> CheckPasswordAsync(UserViewModel userViewModel, string password)
        {
            return _aspUserManager.CheckPasswordAsync(userViewModel, password);
        }

        public Task<IdentityResult> ChangePasswordAsync(UserViewModel userViewModel, string currentPassword, string newPassword)
        {
            return _aspUserManager.ChangePasswordAsync(userViewModel, currentPassword, newPassword);
        }

        public Task<IList<UserViewModel>> GetUsersInRoleAsync(string role)
        {
            return _aspUserManager.GetUsersInRoleAsync(role);
        }
    }
}
