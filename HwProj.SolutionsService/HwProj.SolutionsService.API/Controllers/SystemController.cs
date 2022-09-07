using Microsoft.AspNetCore.Mvc;

namespace HwProj.SolutionsService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemController : ControllerBase
    {
        [HttpGet("status")]
        public IActionResult Status() => Ok();
    }
}
