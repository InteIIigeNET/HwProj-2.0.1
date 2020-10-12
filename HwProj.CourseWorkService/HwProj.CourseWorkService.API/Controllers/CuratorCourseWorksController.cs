using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [Route("api/curator")]
    [ApiController]
    public class CuratorCourseWorksController : ControllerBase
    {
        #region Fields: Private

        private readonly ICourseWorksService _courseWorksService;

        #endregion

        #region Constructors: Public

        public CuratorCourseWorksController(ICourseWorksService courseWorksService)
        {
            _courseWorksService = courseWorksService;
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

        #endregion
    }
}
