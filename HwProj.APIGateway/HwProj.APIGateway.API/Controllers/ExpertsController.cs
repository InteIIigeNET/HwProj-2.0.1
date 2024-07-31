using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Result;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpertsController : AggregationController
    {
        public ExpertsController(
            IAuthServiceClient authServiceClient) : base(authServiceClient)
        {
        }
        
        [HttpPost("register")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Register(RegisterExpertViewModel model)
        {
            var result = await AuthServiceClient.RegisterExpert(model, UserId);
            return Ok(result);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Login(TokenCredentials credentials)
        {
            var result = await AuthServiceClient.LoginExpert(credentials).ConfigureAwait(false);
            return Ok(result);
        }

        [HttpGet("getToken")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(Result<TokenCredentials>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetToken(string expertEmail)
        {
            var tokenMeta = await AuthServiceClient.GetExpertToken(expertEmail);
            return Ok(tokenMeta);
        }
        
        [HttpPost("setProfileIsEdited")]
        [Authorize(Roles = Roles.ExpertRole)]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> SetProfileIsEdited()
        {
            var result = await AuthServiceClient.SetExpertProfileIsEdited(UserId);
            return Ok(result);
        }

        [HttpGet("isProfileEdited")]
        [Authorize(Roles = Roles.ExpertRole)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetIsProfileEdited()
        {
            var result = await AuthServiceClient.GetIsExpertProfileEdited(UserId);
            return Ok(result);
        }
        
        [HttpGet("getAll")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(ExpertDataDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAll()
        {
            var result = await AuthServiceClient.GetAllExperts();
            return Ok(result);
        }

        [HttpPost("updateTags")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateTags(UpdateExpertTagsDTO updateExpertTagsDto)
        {
            var result = await AuthServiceClient.UpdateExpertTags(UserId, updateExpertTagsDto);
            return Ok(result);
        }
    }
}