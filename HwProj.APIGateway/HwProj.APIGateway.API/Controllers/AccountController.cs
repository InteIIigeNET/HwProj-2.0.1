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
            var accountData = await AuthServiceClient.GetAccountData(UserId);

            if (User.IsInRole(Roles.LecturerRole))
            {
                var courses = await _coursesClient.GetAllUserCourses();
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
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            var result = await AuthServiceClient.Register(model);
            return Ok(result);
        }

        [HttpPost("registerExpert")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> RegisterExpert(RegisterExpertViewModel model)
        {
            var result = await AuthServiceClient.RegisterExpert(model);
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
        
        [Authorize]
        [HttpGet("getExpertToken")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetExpertToken(string expertEmail)
        {
            var tokenMeta = await AuthServiceClient.GetExpertToken(expertEmail);
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

        [HttpGet("getAllStudents")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(AccountDataDto[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllStudents()
        {
            var result = await AuthServiceClient.GetAllStudents();
            return Ok(result);
        }
        
        [HttpGet("getAllExperts")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(User[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllExperts()
        {
            var result = await AuthServiceClient.GetAllExperts();
            return Ok(result);
        }
        
        [HttpGet("getExperts")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(User[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetExperts(string userId)
        {
            var result = await AuthServiceClient.GetExperts(userId);
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
