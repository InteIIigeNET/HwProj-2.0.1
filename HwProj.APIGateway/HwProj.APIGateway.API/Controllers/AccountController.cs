using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.Models.AuthService.DTO;
using HwProj.Models.AuthService.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/account")] //localhost:5000/api/account
    public class AccountController : ControllerBase
    {
        private readonly IAuthServiceClient _client;

        public AccountController(IAuthServiceClient client)
        {
            _client = client;
        }

        [HttpGet("getUserData/{userId}")]
        [ProducesResponseType(typeof(AccountDataDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserDataById(string userId)
        {
            var result = await _client.GetAccountData(userId);
            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            var result = await _client.Register(model);

            return Ok(result);
        }
        
        [HttpPost("login")]
        [ProducesResponseType(typeof(TokenCredentials), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            var tokenMeta = await _client.Login(model).ConfigureAwait(false);
            return Ok(tokenMeta);
        }
    }
}
