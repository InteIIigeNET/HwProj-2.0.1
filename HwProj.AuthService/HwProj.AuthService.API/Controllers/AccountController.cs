using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using HwProj.AuthService.API.Services;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using HwProj.Utils.Authorization;
using Microsoft.Extensions.Configuration;
using User = HwProj.Models.AuthService.ViewModels.User;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly IExpertsService _expertsService;
        private readonly IAuthTokenService _tokenService;
        private readonly IUserManager _userManager;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;

        public AccountController(
            IAccountService accountService,
            IUserManager userManager,
            IExpertsService expertsService,
            IAuthTokenService authTokenService,
            IMapper mapper)
        {
            _accountService = accountService;
            _userManager = userManager;
            _expertsService = expertsService;
            _tokenService = authTokenService;
            _mapper = mapper;
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
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
        {
            var newModel = _mapper.Map<RegisterDataDTO>(model);
            var result = await _accountService.RegisterUserAsync(newModel);
            return Ok(result);
        }

        [HttpPost("registerStudentsBatch")]
        public async Task<Result<string>[]> GetRegisterStudentsBatch([FromBody] IEnumerable<RegisterViewModel> models)
        {
            var dtos = _mapper.Map<IEnumerable<RegisterDataDTO>>(models);
            return await _accountService.GetOrRegisterStudentsBatchAsync(dtos);
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
                .Select(u => u.ToAccountDataDto(Roles.StudentRole))
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

        [HttpPost("github/url")]
        [ProducesResponseType(typeof(Result<UrlDto>), (int)HttpStatusCode.OK)]
        public Task<IActionResult> GetGithubLoginUrl(
            [FromServices] IConfiguration configuration,
            [FromBody] UrlDto urlDto)
        {
            var sourceSection = configuration.GetSection("Github");

            var clientId = sourceSection["ClientIdGitHub"];
            var scope = sourceSection["ScopeGitHub"];
            var redirectUrl = urlDto.Url;

            var resultUrl =
                $"https://github.com/login/oauth/authorize?client_id={clientId}&redirect_uri={redirectUrl}&scope={scope}";

            var resultUrlDto = new UrlDto
            {
                Url = resultUrl
            };

            return Task.FromResult<IActionResult>(Ok(resultUrlDto));
        }

        [HttpPost("github/authorize/{userId}")]
        [ProducesResponseType(typeof(GithubCredentials), (int)HttpStatusCode.OK)]
        public async Task<GithubCredentials> GithubAuthorize(
            string userId, [FromQuery] string code)
        {
            var result = await _accountService.AuthorizeGithub(code, userId);
            return result;
        }
        
        [HttpPost("registerInvitedStudent")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> RegisterInvitedStudent([FromBody] RegisterViewModel model)
        {
            var newModel = _mapper.Map<RegisterDataDTO>(model);
            var result = await _accountService.RegisterInvitedStudentAsync(newModel);
            return Ok(result);
        }
        
        [HttpGet("getStudentToken")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetStudentToken(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return Ok(Result<TokenCredentials>.Failed("Пользователь не найден"));
            }
            
            var token = await _tokenService.GetTokenAsync(user);
            return Ok(Result<TokenCredentials>.Success(token));
        }
        
        [HttpPost("loginWithToken")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> LoginWithToken([FromBody] TokenCredentials credentials)
        {
            var result = await _accountService.LoginWithTokenAsync(credentials);
            return Ok(result);
        }
        
        [HttpPost("validateToken")]
        [ProducesResponseType(typeof(Result<TokenValidationResult>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> ValidateToken([FromBody] TokenCredentials tokenCredentials)
        {
            var result = await _accountService.ValidateTokenAsync(tokenCredentials);
            return Ok(result);
        }
    }
}