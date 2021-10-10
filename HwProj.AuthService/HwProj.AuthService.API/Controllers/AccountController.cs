using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using HwProj.AuthService.API.Services;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;
using Google.Apis.Auth;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly IUserManager _userManager;
        private readonly IMapper _mapper;

        public AccountController(IAccountService accountService, IUserManager userManager, IMapper mapper)
        {
            _accountService = accountService;
            _userManager = userManager;
            _mapper = mapper;
        }

        [HttpGet("getUserData/{userId}")]
        [ProducesResponseType(typeof(AccountDataDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserDataById(string userId)
        {
            var accountData = await _accountService.GetAccountDataAsync(userId).ConfigureAwait(false);

            return accountData != null
                ? Ok(accountData)
                : NotFound() as IActionResult;
        }

        [HttpPost("register")]
        [ProducesResponseType(typeof(TokenCredentials), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
        {
            var newModel = _mapper.Map<RegisterDataDTO>(model);
            var result = await _accountService.RegisterUserAsync(newModel).ConfigureAwait(false);
            return Ok(result);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Login([FromBody] LoginViewModel model)
        {
            var tokenMeta = await _accountService.LoginUserAsync(model).ConfigureAwait(false);
            return Ok(tokenMeta);
        }
        
        [HttpPut("edit/{userId}")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Edit([FromBody] EditAccountViewModel model, string userId)
        {
            var newModel = _mapper.Map<EditDataDTO>(model);
            var result = await _accountService.EditAccountAsync(userId, newModel).ConfigureAwait(false);
            return Ok(result);
        }
        
        [HttpPost("inviteNewLecturer")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> InviteNewLecturer(InviteLecturerViewModel model)
        {
            var result = await _accountService.InviteNewLecturer(model.Email).ConfigureAwait(false);
            return Ok(result);
        }
        
        [HttpPost("google/{tokenId}")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GoogleRegister(string tokenId)
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(tokenId, new GoogleJsonWebSignature.ValidationSettings());
            var result = await _accountService.LoginUserByGoogleAsync(payload).ConfigureAwait(false);
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

        [HttpPost("getRole")]
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
            var result = await _accountService.GetAllStudents();
            return result == null
                ? NotFound()
                : Ok(result) as IActionResult;
        }
    }
}
