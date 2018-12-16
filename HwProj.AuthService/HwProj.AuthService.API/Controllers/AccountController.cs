using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.ViewModels;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

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
            var user = new User
            {
                Name = model.Name,
                Surname = model.Surname,
                Email = model.Email,
                UserName = model.UserName
            };

            var result = await userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                await signInManager.SignInAsync(user, false);
                await userManager.AddToRoleAsync(user, "student");
            }
            else
            {
                return BadRequest(result.Errors);
            }

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