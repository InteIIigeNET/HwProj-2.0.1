using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.AuthService.API.Repositories;
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
        private readonly IAuthTokenService _tokenService;
        private readonly IUserManager _userManager;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;

        public AccountController(
            IAccountService accountService,
            IAuthTokenService authTokenService,
            IUserManager userManager,
            IMapper mapper,
            IExpertsRepository expertsRepository)
        {
            _accountService = accountService;
            _tokenService = authTokenService;
            _userManager = userManager;
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
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
        {
            var newModel = _mapper.Map<RegisterDataDTO>(model);
            var result = await _accountService.RegisterUserAsync(newModel);
            return Ok(result);
        }

        [HttpPost("registerExpert/{lecturerId}")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> RegisterExpert([FromBody] RegisterExpertViewModel model, string lecturerId)
        {
            var result = await _accountService.RegisterExpertAsync(model, lecturerId);
            return Ok(result);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Login([FromBody] LoginViewModel model)
        {
            var tokenMeta = await _accountService.LoginUserAsync(model).ConfigureAwait(false);
            return Ok(tokenMeta);
        }
        
        [HttpPost("loginExpert")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> LoginExpert(TokenCredentials tokenCredentials)
        {
            var result = await _accountService.LoginExpertAsync(tokenCredentials).ConfigureAwait(false);
            return Ok(result);
        }
        
        [HttpGet("getExpertToken")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetExpertToken(string expertEmail)
        {
            var expert = await _userManager.FindByEmailAsync(expertEmail);
            var result = await _tokenService.GetExpertTokenAsync(expert).ConfigureAwait(false);
            return Ok(result);
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
        
        [HttpPut("editExpert/{expertId}")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Edit([FromBody] EditExpertViewModel model, string expertId)
        {
            var result = await _accountService.EditExpertAccountAsync(expertId, model);
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
        
        [HttpGet("getAllExperts")]
        [ProducesResponseType(typeof(User[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAllExperts()
        {
            var allExperts = await _accountService.GetUsersInRole(Roles.ExpertRole);
            var result = allExperts.ToArray();

            return Ok(result);
        }
        
        [HttpGet("getExperts/{userId}")]
        [ProducesResponseType(typeof(User[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetExperts(string userId)
        {
            var experts = await _accountService.GetExperts(userId);

            return Ok(experts);
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
    }
}
