using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace HwProj.AuthService.API
{
    public class UserService
    {
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;

        public UserService(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
        }

        public async Task<IdentityResult> ChangeUserPassword(
            User user,
            string newPassword,
            HttpContext httpContext)
        {
            var passwordValidator = httpContext.RequestServices.GetService(
               typeof(IPasswordValidator<User>)) as IPasswordValidator<User>;
            var passwordHasher = httpContext.RequestServices.GetService(
                typeof(IPasswordHasher<User>)) as IPasswordHasher<User>;

            var result = await passwordValidator.ValidateAsync(userManager, user, newPassword);

            if (result.Succeeded)
            {
                user.PasswordHash = passwordHasher.HashPassword(user, newPassword);
                await userManager.UpdateAsync(user);
            }

            return result;
        }

        public async Task<IdentityResult> ChangeUserData(User user, EditViewModel model)
        {
            user.Name = model.NewName ?? user.Name;
            user.Surname = model.NewSurname ?? user.Surname;

            return await userManager.UpdateAsync(user);
        }

        public async Task<IdentityResult> ChangeUserEmail(User user, string newEmai, string code)
        {
            var result = await userManager.ChangeEmailAsync(user, newEmai, code);

            if (result.Succeeded)
            {
                user.UserName = newEmai;
                await userManager.UpdateAsync(user);
            }

            return result;
        }

        public async Task<string> GetCallbackUrlForEmailConfirmation(
            User user,
            HttpContext httpContext,
            IUrlHelper url)
        {
            var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
            return url.Action(
                "confirmemail",
                "Account",
                new { userId = user.Id, code = token },
                protocol: httpContext.Request.Scheme);
        }

        public async Task<string> GetCallbackUrlForChangeEmail(
            User user,
            string newEmail,
            HttpContext httpContext,
            IUrlHelper url)
        {
            var token = await userManager.GenerateChangeEmailTokenAsync(user, newEmail);
            return url.Action(
                "confirmchangeemail",
                "Account",
                new { userId = user.Id, email = newEmail, code = token },
                protocol: httpContext.Request.Scheme);
        }
    }
}
