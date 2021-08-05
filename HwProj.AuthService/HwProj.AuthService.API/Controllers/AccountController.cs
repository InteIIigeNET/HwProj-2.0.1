using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HwProj.AuthService.API.Services;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly IEventBus _eventBus;

        public AccountController(IAccountService accountService, IEventBus eventBus)
        {
            _accountService = accountService;
            _eventBus = eventBus;
        }

        [HttpGet("getUserData/{userId}")]
        [ProducesResponseType(typeof(AccountDataDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserDataById(string userId)
        {
            var accountData = await _accountService.GetAccountDataAsync(userId).ConfigureAwait(false);

            return accountData != null
                ? Ok(accountData)
                : NotFound() as IActionResult;
        }

        [HttpPost("register")]
        [ProducesResponseType(typeof(TokenCredentials), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
        {
            var result = await _accountService.RegisterUserAsync(model).ConfigureAwait(false);
            return Ok(result);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Login([FromBody] LoginViewModel model)
        {
            var tokenMeta = await _accountService.LoginUserAsync(model).ConfigureAwait(false);
            return Ok(tokenMeta);
        }
        
        [HttpPut("edit/{userId}")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Edit([FromBody] EditAccountViewModel model, string userId)
        {
            var result = await _accountService.EditAccountAsync(userId, model).ConfigureAwait(false);
            return Ok(result);
        }
        
        [HttpPost("inviteNewLecturer")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> InviteNewLecturer(InviteLecturerViewModel model)
        {
            var result = await _accountService.InviteNewLecturer(model.Email).ConfigureAwait(false);
            return Ok(result);
        }
    }
}
