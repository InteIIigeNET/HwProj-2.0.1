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
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController(
        IAuthServiceClient authClient,
        ICoursesServiceClient coursesClient,
        ISolutionsServiceClient solutionsServiceClient)
        : AggregationController(authClient)
    {
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
                var courses = await coursesClient.GetAllUserCourses();
                var courseEvents = courses
                    .Select(t => new CourseEvents
                    {
                        Id = t.Id,
                        Name = t.Name,
                        GroupName = t.GroupName,
                        IsCompleted = t.IsCompleted,
                        NewStudentsCount = t.NewStudents.Count()
                    })
                    .Where(t => t.NewStudentsCount > 0)
                    .ToArray();

                return Ok(new UserDataDto
                {
                    UserData = accountData,
                    CourseEvents = courseEvents,
                    TaskDeadlines = Array.Empty<TaskDeadlineView>()
                });
            }

            var currentTime = DateTime.UtcNow;
            var taskDeadlines = await coursesClient.GetTaskDeadlines();
            var taskIds = taskDeadlines.Select(t => t.TaskId).ToArray();
            var solutions = await solutionsServiceClient.GetLastTaskSolutions(taskIds, UserId);
            var taskDeadlinesInfo = taskDeadlines
                .Zip(solutions, (deadline, solution) => (deadline, solution))
                .Where(t => currentTime <= t.deadline.DeadlineDate || t.solution == null)
                .Select(t => new TaskDeadlineView
                {
                    Deadline = t.deadline,
                    SolutionState = t.solution?.State,
                    MaxRating = t.deadline.MaxRating,
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
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
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
            if (!tokenMeta.Succeeded)
            {
                ClearTokenCookie();
                //return BadRequest(tokenMeta);
                return Unauthorized();
            }

            Response.Cookies.Append("accessToken", tokenMeta.Value.AccessToken,
                new CookieOptions
                {
                    Expires = tokenMeta.Value.ExpiresIn,
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict
                });

            if (string.IsNullOrEmpty(tokenMeta.Value.RefreshToken))
            {
                RefreshToken();
            }

            // var antiForgeryToken = );

            return Ok( tokenMeta.Succeeded );
        }

        [Authorize]
        [HttpGet("refreshToken")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> RefreshToken()
        {
            var tokenMeta = await AuthServiceClient.RefreshToken(UserId!);
            Response.Cookies.Append("refreshToken", tokenMeta.Value.AccessToken,
                new CookieOptions
                {
                    Expires = tokenMeta.Value.ExpiresIn,
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict
                });
            return Ok(tokenMeta.Succeeded);
        }

        [HttpPost("logout")]
        [AllowAnonymous]
        public IActionResult Logout()
        {
            ClearTokenCookie();
            return Ok();
        }

        private void ClearTokenCookie()
        {
            if (Request.Cookies.ContainsKey("accessToken"))
            {
                Response.Cookies.Delete("accessToken");
                Response.Cookies.Delete("refreshToken");
            }
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

        [Authorize]
        [HttpPost("github/url")]
        [ProducesResponseType(typeof(UrlDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetGithubLoginUrl([FromBody] UrlDto urlDto)
        {
            var result = await AuthServiceClient.GetGithubLoginUrl(urlDto);
            return Ok(result);
        }

        [Authorize]
        [HttpPost("github/authorize")]
        [ProducesResponseType(typeof(GithubCredentials), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AuthorizeGithub(
            [FromQuery] string code)
        {
            var result = await AuthServiceClient.AuthorizeGithub(code, UserId);

            return Ok(result);
        }
    }
}
