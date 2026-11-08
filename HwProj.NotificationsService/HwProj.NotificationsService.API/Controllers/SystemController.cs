using Microsoft.AspNetCore.Mvc;

namespace HwProj.NotificationsService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemController : ControllerBase
    {
        [HttpGet("ping")]
        public IActionResult Ping() => Ok();
    }
}
