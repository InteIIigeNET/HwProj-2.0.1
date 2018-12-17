using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.ViewModels;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : Controller
    {
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;
        private readonly UserService userService;

        public AccountController(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            userService = new UserService(userManager, signInManager);
        }

        [HttpPost, Route("register")]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if ((await userManager.FindByEmailAsync(model.Email)) != null)
            {
                return BadRequest("Пользователь с таким email уже зарегистрирован");
            }

            var user = (User)model;

            if (!(await userManager.CreateAsync(user, model.Password)).Succeeded)
            {
                return BadRequest();
            }

            await userManager.AddToRoleAsync(user, "student");

            var callbackUrl = await userService.GetCallbackUrlForEmailConfirmation(user, HttpContext, Url);
            // тут отправить Url студенту на почту. а пока он возвращается в Ok

            return Ok(callbackUrl);
        }

        [HttpGet, Route("confirmemail")]
        public async Task<IActionResult> ConfirmEmail(string userId, string code)
        {
            if (userId == null || code == null)
            {
                return BadRequest("Некорректные параметры запроса");
            }

            var user = await userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return BadRequest("Пользователь не найден");
            }

            if (!(await userManager.ConfirmEmailAsync(user, code)).Succeeded)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPost, Route("login")]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if ((await userManager.FindByEmailAsync(model.Email)) == null)
            {
                return BadRequest("Пользователь не найден");
            }

            var user = await userManager.FindByEmailAsync(model.Email);

            if (!await userManager.IsEmailConfirmedAsync(user))
            {
                return BadRequest("Email не был подтвержден");
            }

            var result = await signInManager.PasswordSignInAsync(
                user,
                model.Password,
                model.RememberMe,
                false);

            if (!result.Succeeded)
            {
                return Unauthorized();
            }

            return Ok();
        }

        [HttpPost, Route("logoff")]
        public async void LogOff() => await signInManager.SignOutAsync();

        [HttpPost, Route("edit")]
        [Authorize]
        public async Task<IActionResult> Edit(EditViewModel model)
        {
            if (!signInManager.IsSignedIn(User))
            {
                return BadRequest("Вход не выполнен");
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            if (!(await userService.ChangeUserData(user, model)).Succeeded)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPost, Route("changeemail")]
        [Authorize]
        public async Task<IActionResult> ChangeEmail(ChangeEmailViewModel model)
        {
            if (!signInManager.IsSignedIn(User))
            {
                return BadRequest("Вход не выполнен");
            }

            if ((await userManager.FindByEmailAsync(model.NewEmail)) != null)
            {
                return BadRequest("Пользователь с таким Email уже зарегистрирован");
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            string callbackUrl = await userService.GetCallbackUrlForChangeEmail(user, model.NewEmail, HttpContext, Url);
            // отправить Url для подтвереждения новой почты пользователю. пока возвращаю в Ok

            return Ok(callbackUrl);
        }

        [HttpGet, Route("confirmchangeemail")]
        public async Task<IActionResult> ConfirmChangeEmail(
            string userId,
            string email,
            string code)
        {
            if (userId == null || code == null || email == null)
            {
                return BadRequest("Некорректные параметры запроса");
            }

            var user = await userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return BadRequest("Пользователь не найден");
            }

            if (!(await userService.ChangeUserEmail(user, email, code)).Succeeded)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPost, Route("delete")]
        [Authorize]
        public async Task<IActionResult> Delete(DeleteViewModel model)
        {
            if (!signInManager.IsSignedIn(User))
            {
                return BadRequest("Вход не выполнен");
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            if (!await userManager.CheckPasswordAsync(user, model.Password))
            {
                return BadRequest("Неверный пароль");
            }

            if (!(await userManager.DeleteAsync(user)).Succeeded)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPost, Route("changepassword")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
        {
            if (!signInManager.IsSignedIn(User))
            {
                return BadRequest("Вход не выполнен");
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            if (!await userManager.CheckPasswordAsync(user, model.Password))
            {
                return BadRequest("Неверный пароль");
            }

            if (!(await userService.ChangeUserPassword(user, model.NewPassword, HttpContext)).Succeeded)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPost, Route("invitenewlecturer")]
        [Authorize(Roles = "lecturer")]
        public async Task<IActionResult> InviteNewLecturer(InviteLecturerViewModel model)
        {
            if (!signInManager.IsSignedIn(User))
            {
                return BadRequest("Вход не выполнен");
            }

            var invitedUser = await userManager.FindByEmailAsync(model.EmailOfInvitedPerson);

            if (invitedUser == null)
            {
                return BadRequest("Пользователь не найден");
            }

            await userManager.AddToRoleAsync(invitedUser, "lecturer");
            await userManager.RemoveFromRoleAsync(invitedUser, "student");

            return Ok();
        }
    }
}