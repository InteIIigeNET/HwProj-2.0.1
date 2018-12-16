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
            var user = (User)model;
            var result = await userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            await signInManager.SignInAsync(user, false);
            await userManager.AddToRoleAsync(user, "student");

            return Ok();
        }

        [HttpPost, Route("login")]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            var result = await signInManager.PasswordSignInAsync(
                await userManager.FindByEmailAsync(model.Email),
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
        public async void LogOff()
        {
            await signInManager.SignOutAsync();
        }

        [HttpPost, Route("edit")]
        [Authorize]
        public async Task<IActionResult> Edit(EditViewModel model)
        {
            var user = await userManager.FindByNameAsync(User.Identity.Name);

            user.Name = model.Name ?? "";
            user.Surname = model.Surname ?? "";

            //смена email. генерация токена для подтверждения нового email

            var result = await userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok();
            }

            return BadRequest(result.Errors);
        }

        [HttpPost, Route("inviteLecturer")]
        [Authorize(Roles = "lecturer")]
        public async Task<IActionResult> InviteLecturer(string emailOfInvitedPerson)
        {
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

        [HttpGet, Route("getRoles")]
        public async Task<IList<string>> GetRoles(string email)
        {
            return await userManager.GetRolesAsync(await userManager.FindByEmailAsync(email));
        }
    }
}