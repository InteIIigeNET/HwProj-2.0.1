using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.ViewModels;
using System.Threading.Tasks;
using HwProj.AuthService.API.Extentions;

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

        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            var user = new User(model.Name, model.Surname, model.Email);
            var result = await userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                ModelState.AddModelErrors(result.Errors as IdentityError[]);
                return BadRequest();
            }

            await userManager.AddToRoleAsync(user, "student");

            var token = userManager.GenerateEmailConfirmationTokenAsync(user);
            var verificationLink = Url.Action(
                "ConfirmEmail",
                "Account",
                new { userId = user.Id, userToken = token },
                protocol: HttpContext.Request.Scheme);

            var emailService = new EmailService();
            await emailService.SendEmailAsync(
                user.Email,
                "Подтверждение регистрации",
                $"Для подтверждения регистрации перейдите по ссылке\n" +
                $"<a href='{verificationLink}'>link</a>");

            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> ConfirmEmail(string userId, string userToken)
        {
            if (userId == null || userToken == null)
            {
                return BadRequest();
            }

            var user = await userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return BadRequest();
            }

            var result = await userManager.ConfirmEmailAsync(user, userToken);

            if (!result.Succeeded)
            {
                return BadRequest();
            }

            await signInManager.SignInAsync(user, false);
            return Ok();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            var user = await userManager.FindByNameAsync(model.Email);

            if (user != null && !await userManager.IsEmailConfirmedAsync(user))
            {
                ModelState.AddModelError("", "Попытка авторизации без подтверждения email");
                return BadRequest();
            }

            var result = await signInManager.
                PasswordSignInAsync(model.Email, model.Password, model.RememberMe, false);

            if (!result.Succeeded)
            {
                ModelState.AddModelError("", "Неверный логин или пароль");
                return Unauthorized();
            }

            return Ok();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async void LogOff()
        {
            await signInManager.SignOutAsync();
        }
    }
}