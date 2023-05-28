using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Models;
using HwProj.APIGateway.API.Models.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
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
            var getAccountDataTask = AuthServiceClient.GetAccountData(UserId);
            var getCoursesTask = _coursesClient.GetAllUserCourses();

            await Task.WhenAll(getAccountDataTask, getCoursesTask);

            var courses = GetCoursePreviews(getCoursesTask.Result);

            if (User.IsInRole(Roles.LecturerRole))
            {
                return Ok(new UserDataDto
                {
                    UserData = getAccountDataTask.Result,
                    Courses = await courses,
                    TaskDeadlines = Array.Empty<TaskDeadlineView>()
                });
            }

            var taskDeadlines = await _coursesClient.GetTaskDeadlines();
            var taskIds = taskDeadlines.Select(t => t.TaskId).ToArray();
            var solutions = await _solutionsServiceClient.GetLastTaskSolutions(taskIds, UserId);
            var taskDeadlinesInfo = taskDeadlines.Select((d, i) => new TaskDeadlineView
            {
                Deadline = d,
                SolutionState = solutions[i]?.State,
                Rating = solutions[i]?.Rating,
                MaxRating = taskDeadlines[i].MaxRating
            }).ToArray();

            var aggregatedResult = new UserDataDto
            {
                UserData = getAccountDataTask.Result,
                Courses = await courses,
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

        [HttpPost("resetPassword")]
        [Authorize(Roles = Roles.LecturerRole)]
        public async Task<string> ResetPassword([FromBody] string email)
        {
            try
            {
                return await AuthServiceClient.ResetPassword(email);
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
    }
}
