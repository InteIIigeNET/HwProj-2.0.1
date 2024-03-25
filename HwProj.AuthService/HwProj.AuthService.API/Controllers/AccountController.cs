using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using HwProj.AuthService.API.Services;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Octokit;
using User = HwProj.Models.AuthService.ViewModels.User;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly IUserManager _userManager;
        private readonly UserManager<User> _aspUserManager;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly HttpClient _client;

        public AccountController(
            IAccountService accountService,
            IUserManager userManager,
            UserManager<User> aspUserManager,
            IMapper mapper,
            IHttpClientFactory clientFactory)
        {
            _accountService = accountService;
            _userManager = userManager;
            _aspUserManager = aspUserManager;
            _mapper = mapper;
            _client = clientFactory.CreateClient();
        }

        [HttpGet("getUserData/{userId}")]
        [ProducesResponseType(typeof(AccountDataDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserDataById(string userId)
        {
            var accountData = await _accountService.GetAccountDataAsync(userId).ConfigureAwait(false);

            return accountData != null
                ? Ok(accountData) as IActionResult
                : NotFound();
        }

        [HttpGet("getUserDataByEmail/{email}")]
        [ProducesResponseType(typeof(AccountDataDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserDataByEmail(string email)
        {
            var accountData = await _accountService.GetAccountDataByEmailAsync(email);
            return Ok(accountData);
        }

        [HttpGet("getUsersData")]
        public async Task<AccountDataDto?[]> GetUsersData([FromBody] string[] userIds)
        {
            return await _accountService.GetAccountsDataAsync(userIds);
        }

        [HttpPost("register")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
        {
            var newModel = _mapper.Map<RegisterDataDTO>(model);
            var result = await _accountService.RegisterUserAsync(newModel);
            return Ok(result);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Login([FromBody] LoginViewModel model)
        {
            var tokenMeta = await _accountService.LoginUserAsync(model).ConfigureAwait(false);
            return Ok(tokenMeta);
        }

        [HttpGet("refreshToken")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> RefreshToken(string userId)
        {
            var tokenMeta = await _accountService.RefreshToken(userId);
            return Ok(tokenMeta);
        }

        [HttpPut("edit/{userId}")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Edit([FromBody] EditAccountViewModel model, string userId)
        {
            var newModel = _mapper.Map<EditDataDTO>(model);
            var result = await _accountService.EditAccountAsync(userId, newModel);
            return Ok(result);
        }

        [HttpPost("inviteNewLecturer")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> InviteNewLecturer(InviteLecturerViewModel model)
        {
            var result = await _accountService.InviteNewLecturer(model.Email).ConfigureAwait(false);
            return Ok(result);
        }

        [HttpPut("editExternal/{userId}")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> EditExternal([FromBody] EditExternalViewModel model, string userId)
        {
            var newModel = _mapper.Map<EditDataDTO>(model);
            var result = await _accountService.EditAccountAsync(userId, newModel).ConfigureAwait(false);
            return Ok(result);
        }

        [HttpGet("findByEmail/{email}")]
        [ProducesResponseType(typeof(User), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> FindByEmail(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return Ok(user);
        }

        [HttpGet("getRole")]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetRolesAsync([FromBody] User user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(roles[0]);
        }

        [HttpGet("getAllStudents")]
        [ProducesResponseType(typeof(AccountDataDto[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllStudents()
        {
            var allStudents = await _accountService.GetUsersInRole(Roles.StudentRole);
            var result = allStudents
                .Select(u =>
                    new AccountDataDto(u.Id, u.Name, u.Surname, u.Email, Roles.StudentRole, u.IsExternalAuth,
                        u.MiddleName))
                .ToArray();

            return Ok(result);
        }

        [HttpGet("getAllLecturers")]
        [ProducesResponseType(typeof(User[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllLecturers()
        {
            var allLecturers = await _accountService.GetUsersInRole(Roles.LecturerRole);
            var result = allLecturers.ToArray();

            return Ok(result);
        }

        [HttpPost("requestPasswordRecovery")]
        public async Task<Result> RequestPasswordRecovery(RequestPasswordRecoveryViewModel model)
        {
            return await _accountService.RequestPasswordRecovery(model);
        }

        [HttpPost("resetPassword")]
        public async Task<Result> ResetPassword(ResetPasswordViewModel model)
        {
            return await _accountService.ResetPassword(model);
        }

        [HttpGet("github/url")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        public Task<IActionResult> GetGithubLoginUrl(
            [FromServices] IConfiguration configuration,
            [FromQuery] string source = "HwProj.front")
        {
            var sourceSection = configuration.GetSection(source);

            if (sourceSection is null)
            {
                return Task.FromResult<IActionResult>(BadRequest("source doesn't exist"));
            }
            
            var clientId = sourceSection["ClientIdGitHub"];
            var scope = sourceSection["ScopeGitHub"];
            var redirectUrl = sourceSection["RedirectUri"];
                
            var result =
                $"https://github.com/login/oauth/authorize?client_id={clientId}&redirect_uri={redirectUrl}&scope={scope}";
            
            return Task.FromResult<IActionResult>(Ok(Result<string>.Success(result)));
        }

        [HttpPost("github/authorize/{userId}")]
        [ProducesResponseType(typeof(GithubCredentials), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GithubAuthorize(
            string userId,
            [FromQuery] string code,
            [FromQuery] string source = "HwProj.front")
        {
            var result = await _accountService.AuthorizeGithub(code, source, userId);

            return Ok(result);
        }
    }
}
