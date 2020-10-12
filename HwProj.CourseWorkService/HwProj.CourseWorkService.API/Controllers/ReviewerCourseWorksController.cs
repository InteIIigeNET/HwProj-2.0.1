using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [Route("api/reviewer")]
    [ApiController]
    public class ReviewerCourseWorksController : ControllerBase
    {
    }
}
