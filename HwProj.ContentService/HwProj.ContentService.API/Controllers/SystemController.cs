using Microsoft.AspNetCore.Mvc;

namespace HwProj.ContentService.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SystemController : ControllerBase
{
    [HttpGet("ping")]
    public IActionResult Ping() => Ok();
}
