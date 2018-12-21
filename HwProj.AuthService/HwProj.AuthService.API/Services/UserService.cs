using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using HwProj.AuthService.API.Exceptions;
using System.Security.Claims;

namespace HwProj.AuthService.API.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;

        public UserService(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
        }

        public async Task<User> Get(string Email)
        {
            return await userManager.FindByEmailAsync(Email);
        }

        //IsStudent - true
        public async Task<bool> GetRoleIfUserAuthorized(ClaimsPrincipal User)
        {
            if (!signInManager.IsSignedIn(User))
            {
                throw new UserNotSignInException();
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);
            return (await userManager.GetRolesAsync(user))[0] == "student";
        }

        public async Task<string> GetIdIfUserAuthorized(ClaimsPrincipal User)
        {
            if (!signInManager.IsSignedIn(User))
            {
                throw new UserNotSignInException();
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);
            return await userManager.GetUserIdAsync(user);
        }

        //IsStudent - true
        public async Task<bool> GetRoleById(string userId)
        {
            var user = await userManager.FindByIdAsync(userId);

            if (user == null)
            {
                throw new UserNotFoundException();
            }

            return (await userManager.GetRolesAsync(user))[0] == "student";
        }

        public async Task Edit(EditViewModel model, ClaimsPrincipal User)
        {
            if (!signInManager.IsSignedIn(User))
            {
                throw new UserNotSignInException();
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);
            var result = await ChangeUserData(user, model);

            if (!result.Succeeded)
            {
                throw new FailedExecutionException(result.Errors);
            }
        }

        public async Task ConfirmEmail(string userId, string code)
        {
            var user = await userManager.FindByIdAsync(userId);

            if (user == null)
            {
                throw new UserNotFoundException();
            }

            var result = await userManager.ConfirmEmailAsync(user, code);

            if (!result.Succeeded)
            {
                throw new FailedExecutionException(result.Errors);
            }
        }

        public async Task Login(LoginViewModel model)
        {
            if ((await userManager.FindByEmailAsync(model.Email)) == null)
            {
                throw new UserNotFoundException();
            }

            var user = await userManager.FindByEmailAsync(model.Email);

            if (!await userManager.IsEmailConfirmedAsync(user))
            {
                throw new InvalidEmailException("Email не был подтвержден");
            }

            var result = await signInManager.PasswordSignInAsync(
                user,
                model.Password,
                model.RememberMe,
                false);

            if (!result.Succeeded)
            {
                throw new FailedExecutionException();
            }
        }

        public async Task<string> Register(RegisterViewModel model, HttpContext httpContext, IUrlHelper url)
        {
            if ((await userManager.FindByEmailAsync(model.Email)) != null)
            {
                throw new InvalidEmailException("Пользователь с таким email уже зарегистрирован");
            }

            var user = (User)model;
            var result = await userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                throw new FailedExecutionException(result.Errors);
            }

            await userManager.AddToRoleAsync(user, "student");

            return await GetCallbackUrlForEmailConfirmation(user, httpContext, url);
        }

        public async Task<string> RequestToChangeEmail(
            ChangeEmailViewModel model,
            ClaimsPrincipal User,
            HttpContext httpContext,
            IUrlHelper url)
        {
            if (!signInManager.IsSignedIn(User))
            {
                throw new UserNotSignInException();
            }

            if ((await userManager.FindByEmailAsync(model.NewEmail)) != null)
            {
                throw new InvalidEmailException("Пользователь с таким Email уже зарегистрирован");
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            return await GetCallbackUrlForChangeEmail(user, model.NewEmail, httpContext, url);
        }

        public async Task ConfirmChangeEmail(
            string userId,
            string email,
            string code)
        {
            var user = await userManager.FindByIdAsync(userId);

            if (user == null)
            {
                throw new UserNotFoundException();
            }

            var result = await ChangeEmailAfterConfirm(user, email, code);

            if (!result.Succeeded)
            {
                throw new FailedExecutionException(result.Errors);
            }
        }

        public async Task Delete(DeleteViewModel model, ClaimsPrincipal User)
        {
            if (!signInManager.IsSignedIn(User))
            {
                throw new UserNotSignInException();
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            if (!await userManager.CheckPasswordAsync(user, model.Password))
            {
                throw new InvalidPasswordException();
            }

            if (!(await userManager.DeleteAsync(user)).Succeeded)
            {
                throw new FailedExecutionException();
            }
        }

        public async Task ChangePassword(
            ChangePasswordViewModel model,
            ClaimsPrincipal User,
            HttpContext httpContext)
        {
            if (!signInManager.IsSignedIn(User))
            {
                throw new UserNotSignInException();
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            if (!await userManager.CheckPasswordAsync(user, model.Password))
            {
                throw new InvalidPasswordException();
            }

            var result = await ChangeUserPassword(user, model.NewPassword, httpContext);

            if (!result.Succeeded)
            {
                throw new FailedExecutionException(result.Errors);
            }
        }

        public async Task InviteNewLecturer(InviteLecturerViewModel model, ClaimsPrincipal User)
        {
            if (!signInManager.IsSignedIn(User))
            {
                throw new UserNotSignInException();
            }

            var invitedUser = await userManager.FindByEmailAsync(model.EmailOfInvitedPerson);

            if (invitedUser == null)
            {
                throw new UserNotFoundException();
            }

            await userManager.AddToRoleAsync(invitedUser, "lecturer");
            await userManager.RemoveFromRoleAsync(invitedUser, "student");
        }

        public async Task LogOff() => await signInManager.SignOutAsync();

        private async Task<IdentityResult> ChangeUserPassword(
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

        private async Task<IdentityResult> ChangeEmailAfterConfirm(User user, string newEmai, string code)
        {
            var result = await userManager.ChangeEmailAsync(user, newEmai, code);

            if (result.Succeeded)
            {
                user.UserName = newEmai;
                await userManager.UpdateAsync(user);
            }

            return result;
        }

        private async Task<IdentityResult> ChangeUserData(User user, EditViewModel model)
        {
            user.Name = model.NewName ?? user.Name;
            user.Surname = model.NewSurname ?? user.Surname;

            return await userManager.UpdateAsync(user);
        }

        private async Task<string> GetCallbackUrlForEmailConfirmation(
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

        private async Task<string> GetCallbackUrlForChangeEmail(
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
