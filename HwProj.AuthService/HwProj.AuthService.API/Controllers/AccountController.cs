using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HwProj.AuthService.API.Filters;
using HwProj.AuthService.API.Services;
using HwProj.AuthService.API.ViewModels;
using Newtonsoft.Json;
using System;
using System.Web;
using Microsoft.AspNetCore.Authentication.MicrosoftAccount;
using System.Linq;
using System.Net.Http;
using System.Net;
using Newtonsoft.Json.Linq;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IUserService userService;

        public AccountController(IUserService userService) => this.userService = userService;

        [HttpPost, Route("logingithub")]
        [ExceptionFilter]
        public IActionResult LoginGitHub()
        {
            var uriBuilder = new UriBuilder("https://github.com/login/oauth/authorize");

            var parameters = HttpUtility.ParseQueryString(string.Empty);
            parameters["client_id"] = "724aadcc454b9ed5c1b1";
            parameters["scope"] = "user:email";
            uriBuilder.Query = parameters.ToString();

            var finalUrl = uriBuilder.Uri;
            return Ok(finalUrl);
        }

        [HttpGet, Route("callbackgithub")]
        [ExceptionFilter]
        public async Task<IActionResult> CallbackGitHub()
        {
            var userCode = Request.Query.First(x => x.Key == "code").Value.ToString();

            var uriBuilder = new UriBuilder("https://github.com/login/oauth/access_token");
            var parameters = HttpUtility.ParseQueryString(string.Empty);
            parameters["client_id"] = "724aadcc454b9ed5c1b1";
            parameters["client_secret"] = "5006166a27ce2c3d6477c3dd5ac79a3069f4f001";
            parameters["code"] = userCode;
            uriBuilder.Query = parameters.ToString();
            var finalUrl = uriBuilder.Uri;

            HttpResponseMessage response = null;

            using (var client = new HttpClient())
            {
                response = await client.GetAsync(finalUrl);
            }

            var token = (await response.Content.ReadAsFormDataAsync()).GetValues("access_token").First();


            HttpResponseMessage endResponse = null;

            using (var cclient = new HttpClient())
            {
                cclient.DefaultRequestHeaders.Add("Authorization", "Bearer " + token);
                cclient.DefaultRequestHeaders.Add("User-Agent", "my-agent");
                endResponse = await cclient.GetAsync("https://api.github.com/user");
            }

            return Ok(await endResponse.Content.ReadAsStringAsync());
        }

        [HttpPost, Route("register")]
        [ExceptionFilter]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            var res = await userService.Register(model, HttpContext, Url);
            return Ok(res);
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
            await userService.RequestToChangeEmail(model, User, HttpContext, Url);
            return Ok();
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