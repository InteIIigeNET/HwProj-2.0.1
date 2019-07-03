using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HwProj.AuthService.API.Filters;
using HwProj.AuthService.API.Services;
using HwProj.AuthService.API.ViewModels;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IUserService userService;

        public AccountController(IUserService userService) => this.userService = userService;

        [HttpPost, Route("registergithub")]
        [ExceptionFilter]
        public async Task<IActionResult> RegisterGitHub(RegisterGitHubViewModel model)
        {
            var res = await userService.RegisterGitHub(model, HttpContext, Url);
            return Ok(res);
        }

        [HttpGet, Route("getuserdatabyid")]
        [ExceptionFilter]
        public async Task<IActionResult> GetUserDataById(string userId)
        {
            var userData = await userService.GetUserDataById(userId);

            var response = new
            {
                name = userData[0].ToString(),
                surname = userData[1].ToString(),
                email = userData[2].ToString(),
                role = userData[3].ToString()
            };

            return Ok(response);
        }

        [HttpGet, Route("logingithub")]
        [ExceptionFilter]
        public IActionResult LoginGitHub()
        {
            var signInUri = userService.GetSignInUriGithub();
            return Ok(signInUri);
        }

        [HttpGet, Route("issignin")]
        [ExceptionFilter]
        public IActionResult IsSignIn()
            => Ok(userService.IsSignIn(User));

        [HttpGet, Route("callbackgithub")]
        [ExceptionFilter]
        public async Task<IActionResult> CallbackGitHub()
        {
            var result = await userService.LogInGitHub(User, Request);

            if (result[0].ToString() == "id")
            {
                return Ok(result[1]);
            }

            var response = new
            {
                accessToken = result[0].ToString(),
                expiresIn = (int)result[1]
            };

            return Ok(response);
        }

        [HttpPost, Route("register")]
        [ExceptionFilter]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            await userService.Register(model, HttpContext, Url);
            return Ok();
        }

        [HttpPost, Route("login")]
        [ExceptionFilter]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            var tokenAndMetadata = await userService.Login(model);

            var response = new
            {
                accessToken = tokenAndMetadata[0].ToString(),
                expiresIn = (int)tokenAndMetadata[1]
            };

            return Ok(response);
        }

        [HttpPost, Route("edit")]
        [ExceptionFilter]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> Edit(EditViewModel model)
        {
            await userService.Edit(model, User);
            return Ok();
        }

        [HttpDelete, Route("delete")]
        [ExceptionFilter]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> Delete(DeleteViewModel model)
        {
            await userService.Delete(model, User);
            return Ok();
        }

        [HttpPost, Route("changepassword")]
        [ExceptionFilter]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
        {
            await userService.ChangePassword(model, User, HttpContext);
            return Ok();
        }

        [HttpPost, Route("invitenewlecturer")]
        [ExceptionFilter]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> InviteNewLecturer(InviteLecturerViewModel model)
        {
            await userService.InviteNewLecturer(model, User);
            return Ok();
        }
    }
}