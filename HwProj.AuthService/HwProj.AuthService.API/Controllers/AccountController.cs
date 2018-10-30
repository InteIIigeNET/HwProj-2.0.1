using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using HwProj.AuthService.API.Models;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : Controller
    {
        private readonly UserManager<User> userManager;

        public AccountController(UserManager<User> userManager)
            => this.userManager = userManager;

        [HttpPost]
        public async void Register(RegisterModel model)
        {
            User user = new User
            {
                Name = model.Name,
                Surname = model.Surname,
                Email = model.Email
            };

            var result = await userManager.CreateAsync(user, model.Password);
        }
    }
}