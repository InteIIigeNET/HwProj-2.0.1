using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Models;
using HwProj.APIGateway.API.Models.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using HwProj.SolutionsService.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : AggregationController
    {
        private readonly ICoursesServiceClient _coursesClient;
        private readonly ISolutionsServiceClient _solutionsServiceClient;

        public AccountController(
            IAuthServiceClient authClient,
            ICoursesServiceClient coursesClient,
            ISolutionsServiceClient solutionsServiceClient) : base(authClient)
        {
            _coursesClient = coursesClient;
            _solutionsServiceClient = solutionsServiceClient;
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

        //TODO: separate for mentor and student
        [HttpGet("getUserData")]
        [Authorize]
        [ProducesResponseType(typeof(UserDataDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserData()
        {
            var accountData = await AuthServiceClient.GetAccountData(UserId);

            if (User.IsInRole(Roles.LecturerRole))
            {
                var courses = await _coursesClient.GetAllUserCourses();
                return Ok(new UserDataDto
                {
                    UserData = accountData,
                    Courses = await GetCoursePreviews(courses),
                    TaskDeadlines = Array.Empty<TaskDeadlineView>()
                });
            }

            var currentTime = DateTimeUtils.GetMoscowNow();
            var taskDeadlines = await _coursesClient.GetTaskDeadlines();
            var taskIds = taskDeadlines.Select(t => t.TaskId).ToArray();
            var solutions = await _solutionsServiceClient.GetLastTaskSolutions(taskIds, UserId);
            var taskDeadlinesInfo = taskDeadlines
                .Zip(solutions, (deadline, solution) => (deadline, solution))
                .Where(t => currentTime <= t.deadline.DeadlineDate || t.solution == null)
                .Select(t => new TaskDeadlineView
                {
                    Deadline = t.deadline,
                    SolutionState = t.solution?.State,
                    Rating = t.solution?.Rating,
                    DeadlinePast = currentTime > t.deadline.DeadlineDate
                }).ToArray();

            var aggregatedResult = new UserDataDto
            {
                UserData = accountData,
                TaskDeadlines = taskDeadlinesInfo
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

        [Authorize]
        [HttpGet("refreshToken")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> RefreshToken()
        {
            var tokenMeta = await AuthServiceClient.RefreshToken(UserId!);
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

        [HttpPost("requestPasswordRecovery")]
        public async Task<Result> RequestPasswordRecovery(RequestPasswordRecoveryViewModel model)
        {
            return await AuthServiceClient.RequestPasswordRecovery(model);
        }

        [HttpPost("resetPassword")]
        public async Task<Result> ResetPassword(ResetPasswordViewModel model)
        {
            return await AuthServiceClient.ResetPassword(model);
        }
    }
}
