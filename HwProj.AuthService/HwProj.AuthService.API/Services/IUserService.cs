using HwProj.AuthService.API.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace HwProj.AuthService.API.Services
{
    public interface IUserService
    {
        /// <summary>
        /// Возвращает данные о пользователе 
        /// </summary>
        Task<Dictionary<string, string>> GetUserDataById(string userId);

        /// <summary>
        /// True, если пользователь аутентифицирован
        /// </summary>
        bool IsSignIn(ClaimsPrincipal User);

        /// <summary>
        /// Получение Uri для перехода к аутентификации на стороне github
        /// </summary>
        Uri GetSignInUriGithub();

        /// <summary>
        /// Аутентификация через аккаунт github
        /// </summary>
        Task<List<object>> LogInGitHub(ClaimsPrincipal User, HttpRequest request);

        /// <summary>
        /// Регистрация пользователя 
        /// </summary>
        Task Register(RegisterViewModel model, HttpContext httpContext, IUrlHelper url);

        /// <summary>
        /// Изменение профиля
        /// </summary>
        Task Edit(EditViewModel model, ClaimsPrincipal User);

        /// <summary>
        /// Подтвержения почты в системе
        /// </summary>
        Task ConfirmEmail(string userId, string code);

        /// <summary>
        /// Аутентификация пользователя
        /// </summary>
        Task<List<object>> Login(LoginViewModel model);

        /// <summary>
        /// Обновление токена 
        /// </summary>
        Task<List<object>> RefreshToken(ClaimsPrincipal User);

        /// <summary>
        /// Выполнение запроса на изменение почты 
        /// </summary>
        Task RequestToChangeEmail(
            ChangeEmailViewModel model,
            ClaimsPrincipal User,
            HttpContext httpContext,
            IUrlHelper url);

        /// <summary>
        /// Подтверждение в системе почты после ее изменения
        /// </summary>
        Task ConfirmChangeEmail(string userId, string email, string code);

        /// <summary>
        /// Удаление пользователя 
        /// </summary>
        Task Delete(DeleteViewModel model, ClaimsPrincipal User);

        /// <summary>
        /// Изменение пароля
        /// </summary>
        Task ChangePassword(ChangePasswordViewModel model, ClaimsPrincipal User, HttpContext httpContext);

        /// <summary>
        /// Изменение роли на преподавателя для пользователя из InviteLecturerViewModel
        /// </summary>
        Task InviteNewLecturer(InviteLecturerViewModel model, ClaimsPrincipal User);

        /// <summary>
        /// Выход из системы
        /// </summary>
        Task LogOff();
    }
}