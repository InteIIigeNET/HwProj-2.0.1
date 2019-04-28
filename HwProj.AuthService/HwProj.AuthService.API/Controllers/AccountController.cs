using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HwProj.AuthService.API.Filters;
using HwProj.AuthService.API.Services;
using HwProj.AuthService.API.ViewModels;
using Newtonsoft.Json;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IUserService userService;

        public AccountController(IUserService userService) => this.userService = userService;

        [HttpPost, Route("register")]
        [ExceptionFilter]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            var callbackUrl = await userService.Register(model, HttpContext, Url);
            // тут отправить Url студенту на почту. а пока он возвращается в Ok

            return Ok(callbackUrl);
        }

        [HttpGet, Route("confirmemail")]
        [ExceptionFilter]
        public async Task<IActionResult> ConfirmEmail(string userId, string code)
        {
            if (userId == null || code == null)
            {
                return BadRequest("Некорректные параметры запроса");
            }

            await userService.ConfirmEmail(userId, code);
            return Ok();
        }

        [HttpPost, Route("login")]
        [ExceptionFilter]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            var tokenAndExpiresIn = await userService.Login(model);

            var response = new
            {
                accessToken = tokenAndExpiresIn[0].ToString(),
                expiresIn = (int)tokenAndExpiresIn[1]
            };

            return Ok(response);
        }

        [HttpPost, Route("refresh")]
        [ExceptionFilter]
        public async Task<IActionResult> RefreshToken()
        {
            var tokenAndExpiresIn = await userService.RefreshToken(User);

            var response = new
            {
                accessToken = tokenAndExpiresIn[0].ToString(),
                expiresIn = (int)tokenAndExpiresIn[1]
            };

            return Ok(response);
        }

        [HttpPost, Route("logoff")]
        public async void LogOff() => await userService.LogOff();

        [HttpPost, Route("edit")]
        [ExceptionFilter]
        [Authorize]
        public async Task<IActionResult> Edit(EditViewModel model)
        {
            await userService.Edit(model, User);
            return Ok();
        }

        [HttpPost, Route("changeemail")]
        [ExceptionFilter]
        [Authorize]
        public async Task<IActionResult> ChangeEmail(ChangeEmailViewModel model)
        {
            string callbackUrl = await userService.RequestToChangeEmail(model, User, HttpContext, Url);
            // отправить Url для подтвереждения новой почты пользователю. пока возвращаю в Ok

            return Ok(callbackUrl);
        }

        [HttpGet, Route("confirmchangeemail")]
        [ExceptionFilter]
        public async Task<IActionResult> ConfirmChangeEmail(
            string userId,
            string email,
            string code)
        {
            if (userId == null || code == null || email == null)
            {
                return BadRequest("Некорректные параметры запроса");
            }

            await userService.ConfirmChangeEmail(userId, email, code);
            return Ok();
        }

        [HttpPost, Route("delete")]
        [ExceptionFilter]
        [Authorize]
        public async Task<IActionResult> Delete(DeleteViewModel model)
        {
            await userService.Delete(model, User);
            return Ok();
        }

        [HttpPost, Route("changepassword")]
        [ExceptionFilter]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
        {
            await userService.ChangePassword(model, User, HttpContext);
            return Ok();
        }

        [HttpPost, Route("invitenewlecturer")]
        [ExceptionFilter]
        [Authorize(Roles = "lecturer")]
        public async Task<IActionResult> InviteNewLecturer(InviteLecturerViewModel model)
        {
            await userService.InviteNewLecturer(model, User);
            return Ok();
        }
    }
}