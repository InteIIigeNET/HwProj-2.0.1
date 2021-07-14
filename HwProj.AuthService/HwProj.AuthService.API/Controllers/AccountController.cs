using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.API.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HwProj.AuthService.API.Models.ViewModels;
using HwProj.AuthService.API.Services;
using HwProj.Utils.Authorization;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet("getUserData/{userId}")]
        [ProducesResponseType(typeof(AccountDataDTO), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserDataById(string userId)
        {
            var accountData = await _accountService.GetAccountDataAsync(userId).ConfigureAwait(false);

            return accountData != null
                ? Ok(accountData)
                : NotFound() as IActionResult;
        }

        [Authorize]
        [HttpGet("getCurrentUserData")]
        public IActionResult GetCurrentUserData()
        {
            var userId = Request.GetUserId();
            return RedirectToAction("GetUserDataById", new { userId });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            var result = await _accountService.RegisterUserAsync(model).ConfigureAwait(false);

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            var tokenMeta = await _accountService.LoginUserAsync(model).ConfigureAwait(false);
            return Ok(tokenMeta);
        }

        [Authorize]
        [HttpPut("edit")]
        public async Task<IActionResult> Edit(EditAccountViewModel model)
        {
            var result = await _accountService.EditAccountAsync(Request.GetUserId(), model).ConfigureAwait(false);
            return Ok(result);
        }

        [Authorize]
        [HttpPost("invitenewlecturer")]
        public async Task<IActionResult> InviteNewLecturer(InviteLecturerViewModel model)
        {
            var result = await _accountService.InviteNewLecturer(model.Email).ConfigureAwait(false);
            return Ok(result);
        }
    }
}
