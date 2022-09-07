using Microsoft.AspNetCore.Mvc;

namespace HwProj.AuthService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemController : ControllerBase
    {
        [HttpGet("status")]
        public IActionResult Status() => Ok();
    }
}
