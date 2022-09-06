using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.Models.ApiGateway;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.NotificationsService;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using HwProj.NotificationsService.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : AggregationController
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
                ? NotFound() as IActionResult
                : Ok(result);
        }

        [HttpGet("getUserData")]
        [Authorize]
        [ProducesResponseType(typeof(UserDataDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserData()
        {
            var getAccountDataTask = _authClient.GetAccountData(UserId);
            var getNotificationsTask = _notificationsClient.Get(UserId, new NotificationFilter());

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
            var result = await _authClient.Edit(model, UserId);
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
            var result = await _authClient.EditExternal(model, UserId);
            return Ok(result);
        }

        [HttpGet("getAllStudents")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(AccountDataDto[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllStudents()
        {
            var result = await _authClient.GetAllStudents();
            return Ok(result);
        }
    }
}
