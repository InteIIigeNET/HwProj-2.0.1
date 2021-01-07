using HwProj.CourseWorkService.API.Filters;
using HwProj.CourseWorkService.API.Models.UserInfo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [Route("api/reviewer")]
    [TypeFilter(typeof(OnlySelectRoleAttribute), Arguments = new object[] { Roles.Reviewer })]
    [ApiController]
    public class ReviewerCourseWorksController : ControllerBase
    {
    }
}
