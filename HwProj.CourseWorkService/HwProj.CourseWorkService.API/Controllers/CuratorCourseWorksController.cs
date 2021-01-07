using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Exceptions;
using HwProj.CourseWorkService.API.Filters;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Services.Interfaces;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [Route("api/curator")]
    [TypeFilter(typeof(OnlySelectRoleAttribute), Arguments = new object[] { Roles.Curator })]
    [TypeFilter(typeof(CommonExceptionFilterAttribute),
        Arguments = new object[] { new[] { typeof(ObjectNotFoundException) } })]
    [ApiController]
    public class CuratorCourseWorksController : ControllerBase
    {
        #region Fields: Private

        private readonly ICourseWorksService _courseWorksService;
        private readonly IUniversityService _universityService;
        private readonly IUserService _userService;

        #endregion

        #region Constructors: Public

        public CuratorCourseWorksController(ICourseWorksService courseWorksService,
            IUniversityService universityService, IUserService userService)
        {
            _courseWorksService = courseWorksService;
            _universityService = universityService;
            _userService = userService;
        }

        #endregion

        #region Methods: Public

        [HttpPost("course_works/add")]
        [ProducesResponseType(typeof(int), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> AddCourseWorkAsync([FromBody] CreateCourseWorkViewModel createCourseWorkViewModel)
        {
            var userId = Request.GetUserId();
            var id = await _courseWorksService.AddCourseWorkAsync(createCourseWorkViewModel, userId, true);
            return Ok(id);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfileAsync([FromBody] CuratorProfileViewModel curatorProfileViewModel)
        {
            var userId = Request.GetUserId();
            await _userService.UpdateUserRoleProfile<CuratorProfile, CuratorProfileViewModel>(userId, curatorProfileViewModel)
                .ConfigureAwait(false);
            return Ok();
        }

        [HttpPost("invite")]
        public async Task<IActionResult> InviteCuratorAsync([FromBody] InviteCuratorViewModel model)
        {
            await _userService.InviteCuratorAsync(model.Email);
            return Ok();
        }

        [HttpPost("directions")]
        public async Task<IActionResult> AddDirectionAsync([FromBody] AddDirectionViewModel directionViewModel)
        {
            await _universityService.AddDirectionAsync(directionViewModel).ConfigureAwait(false);
            return Ok();
        }

        [HttpDelete("directions/{directionId}")]
        public async Task<IActionResult> DeleteDirectionAsync(long directionId)
        {
            await _universityService.DeleteDirectionAsync(directionId).ConfigureAwait(false);
            return Ok();
        }

        [HttpPost("departments")]
        public async Task<IActionResult> AddDepartmentAsync([FromBody] AddDepartmentViewModel departmentViewModel)
        {
            await _universityService.AddDepartmentAsync(departmentViewModel).ConfigureAwait(false);
            return Ok();
        }

        [HttpDelete("departments/{departmentId}")]
        public async Task<IActionResult> DeleteDepartmentAsync(long departmentId)
        {
            await _universityService.DeleteDepartmentAsync(departmentId).ConfigureAwait(false);
            return Ok();
        }

        #endregion
    }
}
