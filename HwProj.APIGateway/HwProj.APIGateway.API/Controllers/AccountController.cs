using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Models;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
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
        private readonly ICoursesServiceClient _coursesClient;

        public AccountController(
            IAuthServiceClient authClient,
            INotificationsServiceClient notificationsClient,
            ICoursesServiceClient coursesClient) : base(authClient)
        {
            _notificationsClient = notificationsClient;
            _coursesClient = coursesClient;
        }

        [HttpGet("getUserData/{userId}")]
        [ProducesResponseType(typeof(AccountDataDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserDataById(string userId)
        {
            var result = await AuthServiceClient.GetAccountData(userId);
            return result == null
                ? NotFound() as IActionResult
                : Ok(result);
        }

        [HttpGet("getUserData")]
        [Authorize]
        [ProducesResponseType(typeof(UserDataDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserData()
        {
            var getAccountDataTask = AuthServiceClient.GetAccountData(UserId);
            var getCoursesTask = _coursesClient.GetAllUserCourses();
            var getTaskDeadlines = _coursesClient.GetTaskDeadlines();

            await Task.WhenAll(getAccountDataTask, getCoursesTask, getTaskDeadlines);

            var aggregatedResult = new UserDataDto
            {
                UserData = getAccountDataTask.Result,
                Courses = await GetCoursePreviews(getCoursesTask.Result),
                TaskDeadlines = getTaskDeadlines.Result
            };
            return Ok(aggregatedResult);
        }

        [HttpPost("register")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            var result = await AuthServiceClient.Register(model);
            return Ok(result);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            var tokenMeta = await AuthServiceClient.Login(model).ConfigureAwait(false);
            return Ok(tokenMeta);
        }

        [HttpPut("edit")]
        [Authorize]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Edit(EditAccountViewModel model)
        {
            var result = await AuthServiceClient.Edit(model, UserId);
            return Ok(result);
        }

        [HttpPost("inviteNewLecturer")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> InviteNewLecturer(InviteLecturerViewModel model)
        {
            var result = await AuthServiceClient.InviteNewLecturer(model).ConfigureAwait(false);
            return Ok(result);
        }

        [HttpPost("google")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> LoginByGoogle(string tokenId)
        {
            var tokenMeta = await AuthServiceClient.LoginByGoogle(tokenId).ConfigureAwait(false);
            return Ok(tokenMeta);
        }

        [HttpPut("editExternal")]
        [Authorize]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> EditExternal(EditExternalViewModel model)
        {
            var result = await AuthServiceClient.EditExternal(model, UserId);
            return Ok(result);
        }

        [HttpGet("getAllStudents")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(AccountDataDto[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllStudents()
        {
            var result = await AuthServiceClient.GetAllStudents();
            return Ok(result);
        }
    }
}
