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
        /// Регистрация пользователя 
        /// </summary>
        Task Register(RegisterViewModel model, HttpContext httpContext, IUrlHelper url);

        /// <summary>
        /// Изменение профиля
        /// </summary>
        Task Edit(EditViewModel model, ClaimsPrincipal User);

        /// <summary>
        /// Аутентификация пользователя
        /// </summary>
        Task<List<object>> Login(LoginViewModel model);

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
    }
}