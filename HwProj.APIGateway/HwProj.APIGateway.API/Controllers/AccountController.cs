using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.Models.ApiGateway;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.Client;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/account")]
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
            return Ok(result);
        }

        [HttpGet("getUserData")]
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
        public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
        {
            var result = await _authClient.Register(model);
            return Ok(result);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Login([FromBody] LoginViewModel model)
        {
            var tokenMeta = await _authClient.Login(model).ConfigureAwait(false);
            return Ok(tokenMeta);
        }
    }
}
