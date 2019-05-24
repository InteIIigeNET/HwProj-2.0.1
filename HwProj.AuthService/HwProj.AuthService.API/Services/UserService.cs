using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using HwProj.AuthService.API.Exceptions;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System;
using Microsoft.Extensions.Primitives;

namespace HwProj.AuthService.API.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;
        private readonly TokenService tokenService;
        private readonly EmailService emailService;
        private readonly ThirdPartyProviderService providerService;

        public UserService(UserManager<User> userManager,
            SignInManager<User> signInManager,
            IOptions<AppSettings> appSettings)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            tokenService = new TokenService(userManager, appSettings);
            emailService = new EmailService(appSettings);
            providerService = new ThirdPartyProviderService(userManager, appSettings);
        }

        /// <summary>
        /// Возвращает данные о пользователе 
        /// </summary>
        public async Task<Dictionary<string, string>> GetUserDataById(string userId)
        {
            if ((await userManager.FindByIdAsync(userId)) == null)
            {
                throw new UserNotFoundException();
            }

            var user = await userManager.FindByIdAsync(userId);
            var userRole = (await userManager.GetRolesAsync(user))[0];

            var userData = new Dictionary<string, string>
            {
                { "name", user.Name },
                { "surname", user.Surname },
                { "email", user.Email },
                { "role", userRole }
            };

            return userData;
        }

        /// <summary>
        /// True, если пользователь аутентифицирован
        /// </summary>
        public bool IsSignIn(ClaimsPrincipal User)
            => signInManager.IsSignedIn(User);

        /// <summary>
        /// Получение Uri для перехода к аутентификации на стороне github
        /// </summary>
        public Uri GetSignInUriGithub()
            => providerService.GetSignInUriGithub();

        /// <summary>
        /// Аутентификация через аккаунт github
        /// </summary>
        public async Task<List<object>> LogInGitHub(ClaimsPrincipal User, HttpRequest request)
        {
            if (!request.Query.TryGetValue("code", out StringValues code))
            {
                throw new FailedExecutionException();
            }

            var userCode = code.ToString();
            var userIdGitHub = await providerService.GetUserIdGitHub(userCode);

            if (signInManager.IsSignedIn(User))
            {
                var user = await userManager.FindByNameAsync(User.Identity.Name);
                await providerService.BindGitHub(user, userIdGitHub);
                return await tokenService.GetToken(user);
            }

            User userGitHub = await providerService.GetUserGitHub(userIdGitHub);

            if (userGitHub == null)
            {
                throw new FailedLogInGitHubException();
            }

            await signInManager.SignInAsync(userGitHub, false, "LogInGitHub");
            return await tokenService.GetToken(userGitHub);
        }

        /// <summary>
        /// Изменение профиля
        /// </summary>
        public async Task Edit(EditViewModel model, ClaimsPrincipal User)
        {
            var id = User.FindFirst("_id").Value;

            var user = await userManager.FindByIdAsync(id);
            var result = await ChangeUserData(user, model);

            if (!result.Succeeded)
            {
                throw new FailedExecutionException(result.Errors);
            }
        }

        /// <summary>
        /// Подтвержения почты в системе
        /// </summary>
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

        /// <summary>
        /// Аутентификация пользователя
        /// </summary>
        public async Task<List<object>> Login(LoginViewModel model)
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

            return await tokenService.GetToken(user);
        }

        /// <summary>
        /// Обновление токена 
        /// </summary>
        public async Task<List<object>> RefreshToken(ClaimsPrincipal User)
        {
            if (!signInManager.IsSignedIn(User))
            {
                throw new UserNotSignInException();
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            return await tokenService.GetToken(user);
        }

        /// <summary>
        /// Регистрация пользователя 
        /// </summary>
        public async Task Register(RegisterViewModel model, HttpContext httpContext, IUrlHelper url)
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

            // для подтверждения почты письмом вернуть emailService.SendEmailForConfirmation
            user.EmailConfirmed = true;
            await userManager.UpdateAsync(user);
        }

        /// <summary>
        /// Выполнение запроса на изменение почты 
        /// </summary>
        public async Task RequestToChangeEmail(
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

            await emailService.SendEmailForConfirmation(
                model.NewEmail,
                await GetCallbackUrlForChangeEmail(user, model.NewEmail, httpContext, url));
        }

        /// <summary>
        /// Подтверждение в системе почты после ее изменения
        /// </summary>
        public async Task ConfirmChangeEmail(string userId, string email, string code)
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

        /// <summary>
        /// Удаление пользователя 
        /// </summary>
        public async Task Delete(DeleteViewModel model, ClaimsPrincipal User)
        {
            var id = User.FindFirst("_role").Value;
            var user = await userManager.FindByIdAsync(id);

            if (!await userManager.CheckPasswordAsync(user, model.Password))
            {
                throw new InvalidPasswordException();
            }

            if (!(await userManager.DeleteAsync(user)).Succeeded)
            {
                throw new FailedExecutionException();
            }

            await signInManager.SignOutAsync();
        }

        /// <summary>
        /// Изменение пароля
        /// </summary>
        public async Task ChangePassword(
            ChangePasswordViewModel model,
            ClaimsPrincipal User,
            HttpContext httpContext)
        {
            var id = User.FindFirst("_role").Value;
            var user = await userManager.FindByIdAsync(id);

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

        /// <summary>
        /// Изменение роли на преподавателя для пользователя из InviteLecturerViewModel
        /// </summary>
        public async Task InviteNewLecturer(InviteLecturerViewModel model, ClaimsPrincipal User)
        {
            if (User.FindFirst("_role").Value != "lecturer")
            {
                throw new FailedExecutionException();
            }

            var invitedUser = await userManager.FindByEmailAsync(model.EmailOfInvitedPerson);

            if (invitedUser == null)
            {
                throw new UserNotFoundException();
            }

            await userManager.AddToRoleAsync(invitedUser, "lecturer");
            await userManager.RemoveFromRoleAsync(invitedUser, "student");
        }

        /// <summary>
        /// Выход из системы
        /// </summary>
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