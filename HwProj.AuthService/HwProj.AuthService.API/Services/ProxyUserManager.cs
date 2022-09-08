using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.Models.AuthService.ViewModels;
using Microsoft.AspNetCore.Identity;

namespace HwProj.AuthService.API.Services
{
    public class ProxyUserManager : IUserManager
    {
        private readonly UserManager<User> _aspUserManager;

        public ProxyUserManager(UserManager<User> aspUserManager)
        {
            _aspUserManager = aspUserManager;
        }
        
        public Task<IdentityResult> CreateAsync(User user)
        {
            return _aspUserManager.CreateAsync(user);
        }

        public Task<IdentityResult> CreateAsync(User user, string password)
        {
            return _aspUserManager.CreateAsync(user, password);
        }

        public Task<User> FindByIdAsync(string id)
        {
            return _aspUserManager.FindByIdAsync(id);
        }

        public Task<User> FindByEmailAsync(string email)
        {
            return _aspUserManager.FindByEmailAsync(email);
        }

        public Task<IdentityResult> UpdateAsync(User user)
        {
            return _aspUserManager.UpdateAsync(user);
        }

        public Task<IdentityResult> AddToRoleAsync(User user, string role)
        {
            return _aspUserManager.AddToRoleAsync(user, role);
        }

        public Task<IdentityResult> RemoveFromRoleAsync(User user, string role)
        {
            return _aspUserManager.RemoveFromRoleAsync(user, role);
        }

        public Task<IList<string>> GetRolesAsync(User user)
        {
            return _aspUserManager.GetRolesAsync(user);
        }

        public Task<bool> IsEmailConfirmedAsync(User user)
        {
            return _aspUserManager.IsEmailConfirmedAsync(user);
        }

        public Task<bool> CheckPasswordAsync(User user, string password)
        {
            return _aspUserManager.CheckPasswordAsync(user, password);
        }

        public Task<IdentityResult> ChangePasswordAsync(User user, string currentPassword, string newPassword)
        {
            return _aspUserManager.ChangePasswordAsync(user, currentPassword, newPassword);
        }

        public Task<IList<User>> GetUsersInRoleAsync(string role)
        {
            return _aspUserManager.GetUsersInRoleAsync(role);
        }
    }
}
