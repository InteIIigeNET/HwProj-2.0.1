using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Filters;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services;
using HwProj.CourseWorkService.API.Services.Interfaces;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [Route("api/curator")]
    [TypeFilter(typeof(OnlySelectRoleAttribute), Arguments = new object[] { RoleNames.Curator })]
    [ApiController]
    public class CuratorCourseWorksController : ControllerBase
    {
        #region Fields: Private

        private readonly ICourseWorksService _courseWorksService;
        private readonly IUserService _userService;
        private readonly IUsersRepository _usersRepository;

        #endregion

        #region Constructors: Public

        public CuratorCourseWorksController(ICourseWorksService courseWorksService, IUsersRepository usersRepository,
            IUserService userService)
        {
            _courseWorksService = courseWorksService;
            _userService = userService;
            _usersRepository = usersRepository;
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

        [HttpPost("invite")]
        public async Task<IActionResult> InviteCuratorAsync([FromBody] string email)
        {
            var user = await _usersRepository.FindAsync(u => u.Email == email).ConfigureAwait(false);
            if (user == null) return NotFound();

            var userRoles = await _usersRepository.GetRoles(user.Id).ConfigureAwait(false);
            if (!userRoles.Contains(RoleNames.Curator) && userRoles.Contains(RoleNames.Lecturer))
            {
                await _usersRepository.AddRoleAsync(user.Id, RoleNames.Curator);
            }

            return Ok();
        }

        [HttpPost("directions")]
        public async Task<IActionResult> AddDirectionAsync([FromBody] AddDirectionViewModel directionViewModel)
        {
            await _userService.AddDirectionAsync(directionViewModel).ConfigureAwait(false);
            return Ok();
        }

        [HttpDelete("directions/{directionId}")]
        public async Task<IActionResult> DeleteDirectionAsync(long directionId)
        {
            await _userService.DeleteDirectionAsync(directionId).ConfigureAwait(false);
            return Ok();
        }

        #endregion
    }
}
