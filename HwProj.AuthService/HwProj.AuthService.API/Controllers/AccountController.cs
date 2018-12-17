using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.ViewModels;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : Controller
    {
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;

        public AccountController(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
        }

        [HttpPost, Route("register")]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if ((await userManager.FindByEmailAsync(model.Email)) != null)
            {
                return BadRequest("Пользователь с таким email уже зарегистрирован");
            }

            var user = (User)model;
            var result = await userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            await userManager.AddToRoleAsync(user, "student");

            var callbackUrl = await GetCallbackUrlForEmailConfirmation(user);
            // тут отправить Url студенту на почту. а пока он возвращается в Ok

            return Ok(callbackUrl);
        }
        
        [HttpGet, Route("confirmemail")]
        public async Task<IActionResult> ConfirmEmail(string userId, string code)
        {
            if (userId == null || code == null)
            {
                return BadRequest();
            }

            var user = await userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return BadRequest();
            }

            var result = await userManager.ConfirmEmailAsync(user, code);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok();
        }

        [HttpPost, Route("login")]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if ((await userManager.FindByEmailAsync(model.Email)) == null)
            {
                return BadRequest();
            }

            var user = await userManager.FindByEmailAsync(model.Email);

            if (!await userManager.IsEmailConfirmedAsync(user))
            {
                return BadRequest("email не был подтвержден");
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
                return BadRequest();
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            user.Name = model.NewName ?? user.Name;
            user.Surname = model.NewSurname ?? user.Surname;

            var result = await userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok();
        }

        [HttpPost, Route("changeemail")]
        [Authorize]
        public async Task<IActionResult> ChangeEmail(ChangeEmailViewModel model)
        {
            if (!signInManager.IsSignedIn(User))
            {
                return BadRequest();
            }

            if ((await userManager.FindByEmailAsync(model.NewEmail)) != null)
            {
                return BadRequest("Пользователь с таким email уже зарегистрирован");
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            string callbackUrl = await GetCallbackUrlForChangeEmail(user, model.NewEmail);
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
                return BadRequest();
            }

            var user = await userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return BadRequest();
            }

            var result = await userManager.ChangeEmailAsync(user, email, code);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            user.UserName = email;
            await userManager.UpdateAsync(user);

            return Ok();
        }

        [HttpPost, Route("delete")]
        [Authorize]
        public async Task<IActionResult> Delete(DeleteViewModel model)
        {
            if (!signInManager.IsSignedIn(User))
            {
                return BadRequest();
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            if (!await userManager.CheckPasswordAsync(user, model.Password))
            {
                return BadRequest("Неверный пароль");
            }

            var result = await userManager.DeleteAsync(user);

            if (result.Succeeded)
            {
                return Ok();
            }

            return BadRequest(result.Errors);
        }

        [HttpPost, Route("changepassword")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
        {
            if (!signInManager.IsSignedIn(User))
            {
                return BadRequest();
            }

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            var passwordValidator = HttpContext.RequestServices.GetService(
                typeof(IPasswordValidator<User>)) as IPasswordValidator<User>;
            var passwordHasher = HttpContext.RequestServices.GetService(
                typeof(IPasswordHasher<User>)) as IPasswordHasher<User>;

            var result = await passwordValidator.ValidateAsync(userManager, user, model.NewPassword);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            user.PasswordHash = passwordHasher.HashPassword(user, model.NewPassword);
            await userManager.UpdateAsync(user);

            return Ok();
        }

        [HttpPost, Route("invitelecturer")]
        [Authorize(Roles = "lecturer")]
        public async Task<IActionResult> InviteLecturer(string emailOfInvitedPerson)
        {
            if (!signInManager.IsSignedIn(User))
            {
                return BadRequest();
            }

            var invitedUser = await userManager.FindByEmailAsync(emailOfInvitedPerson);

            if (invitedUser == null)
            {
                return BadRequest("Пользователь не найден");
            }

            await userManager.AddToRoleAsync(invitedUser, "lecturer");
            await userManager.RemoveFromRoleAsync(invitedUser, "student");

            return Ok();
        }

        [HttpGet, Route("getAll")]
        public IQueryable<User> Get()
        {
            return userManager.Users;
        }

        private async Task<string> GetCallbackUrlForEmailConfirmation(User user)
        {
            var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
            return Url.Action(
                "confirmemail",
                "Account",
                new { userId = user.Id, code = token },
                protocol: HttpContext.Request.Scheme);
        }

        private async Task<string> GetCallbackUrlForChangeEmail(User user, string newEmail)
        {
            var token = await userManager.GenerateChangeEmailTokenAsync(user, newEmail);
            return Url.Action(
                "confirmchangeemail",
                "Account",
                new { userId = user.Id, email = newEmail, code = token },
                protocol: HttpContext.Request.Scheme);
        }
    }
}