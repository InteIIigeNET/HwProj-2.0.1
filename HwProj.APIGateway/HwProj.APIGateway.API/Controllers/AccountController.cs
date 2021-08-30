using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.Models.ApiGateway;
using HwProj.Models.AuthService;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.NotificationsService;
using HwProj.Models.Roles;
using HwProj.NotificationsService.Client;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly INotificationsServiceClient _notificationsClient;
        private readonly IAuthServiceClient _authClient;

        public AccountController(IAuthServiceClient authClient, INotificationsServiceClient notificationsClient)
        {
            _notificationsClient = notificationsClient;
            _authClient = authClient;
        }

        [HttpGet("getUserData/{userId}")]
        [ProducesResponseType(typeof(AccountDataDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserDataById(string userId)
        {
            var result = await _authClient.GetAccountData(userId);
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }

        [HttpGet("getUserData")]
        [Authorize]
        [ProducesResponseType(typeof(UserDataDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserData()
        {
            var userId = Request.GetUserId();

            var getAccountDataTask = _authClient.GetAccountData(userId);
            var getNotificationsTask = _notificationsClient.Get(userId, new NotificationFilter());

            await Task.WhenAll(getAccountDataTask, getNotificationsTask);

            var aggregatedResult = new UserDataDto
            {
                UserData = getAccountDataTask.Result,
                Notifications = getNotificationsTask.Result
            };
            return Ok(aggregatedResult);
        }

        [HttpPost("register")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            var result = await _authClient.Register(model);
            return Ok(result);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            var tokenMeta = await _authClient.Login(model).ConfigureAwait(false);
            return Ok(tokenMeta);
        }

        [HttpPut("edit")]
        [Authorize]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Edit(EditAccountViewModel model)
        {
            var userId = Request.GetUserId();
            var result = await _authClient.Edit(model, userId).ConfigureAwait(false);
            return Ok(result);
        }

        [HttpPost("inviteNewLecturer")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> InviteNewLecturer(InviteLecturerViewModel model)
        {
            var result = await _authClient.InviteNewLecturer(model).ConfigureAwait(false);
            return Ok(result);
        }
        
        [HttpPost("google")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> LoginByGoogle(string tokenId)
        {
            var tokenMeta = await _authClient.LoginByGoogle(tokenId).ConfigureAwait(false);
            return Ok(tokenMeta);
        }
        
        [HttpPut("editExternal")]
        [Authorize]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> EditExternal(EditExternalViewModel model)
        {
            var userId = Request.GetUserId();
            var result = await _authClient.EditExternal(model, userId).ConfigureAwait(false);
            return Ok(result);
        }
    }
}
