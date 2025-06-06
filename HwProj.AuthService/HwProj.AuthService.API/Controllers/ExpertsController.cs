using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.API.Services;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpertsController : ControllerBase
    {
        private readonly IExpertsService _expertsService;
        private readonly IAuthTokenService _tokenService;
        private readonly IUserManager _userManager;

        public ExpertsController(
            IExpertsService expertsService,
            IAuthTokenService authTokenService,
            IUserManager userManager)
        {
            _expertsService = expertsService;
            _tokenService = authTokenService;
            _userManager = userManager;
        }

        [HttpPost("register")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Register([FromBody] RegisterExpertViewModel model, string lecturerId)
        {
            var result = await _expertsService.RegisterExpertAsync(model, lecturerId);
            return Ok(result);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Login(TokenCredentials tokenCredentials)
        {
            var result = await _expertsService.LoginExpertAsync(tokenCredentials).ConfigureAwait(false);
            return Ok(result);
        }

        [HttpGet("getToken")]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetToken(string expertEmail)
        {
            var expert = await _userManager.FindByEmailAsync(expertEmail);
            var result = await _tokenService.GetExpertTokenAsync(expert).ConfigureAwait(false);
            return Ok(result);
        }

        [HttpGet("isProfileEdited/{expertId}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetIsProfileEdited(string expertId)
        {
            var result = await _expertsService.GetIsExpertProfileEdited(expertId);
            return Ok(result);
        }

        [HttpPost("setProfileIsEdited/{expertId}")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> SetProfileIsEdited(string expertId)
        {
            var result = await _expertsService.SetExpertProfileIsEdited(expertId);
            return Ok(result);
        }

        [HttpGet("getAll")]
        [ProducesResponseType(typeof(ExpertDataDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAll()
        {
            var allExperts = await _expertsService.GetAllExperts();

            return Ok(allExperts);
        }

        [HttpPost("updateTags")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateTags(string lecturerId, [FromBody] UpdateExpertTagsDTO updateExpertTagsDto)
        {
            var experts = await _expertsService.UpdateExpertTags(lecturerId, updateExpertTagsDto);

            return Ok(experts);
        }
    }
}