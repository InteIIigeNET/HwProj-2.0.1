using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Filters;
using HwProj.CourseWorkService.API.Models;
using Microsoft.AspNetCore.Mvc;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services;
using HwProj.CourseWorkService.API.Services.Interfaces;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [TypeFilter(typeof(OnlySelectRoleAttribute), Arguments = new object[] { RoleNames.Student })]
    [Route("api/student")]
    [ApiController]
    public class StudentCourseWorksController : ControllerBase
    {
        #region Fields: Private

        private readonly IApplicationsService _applicationsService;
        private readonly IApplicationsRepository _applicationsRepository;
        private readonly ICourseWorksRepository _courseWorksRepository;

        #endregion

        #region Constructors: Public

        public StudentCourseWorksController(IApplicationsService applicationsService, IApplicationsRepository applicationsRepository,
            ICourseWorksRepository courseWorksRepository)
        {
            _applicationsService = applicationsService;
            _applicationsRepository = applicationsRepository;
            _courseWorksRepository = courseWorksRepository;
        }

        #endregion

        #region Methods: Public

        //[HttpPut("profile")]
        //public async Task<IActionResult> UpdateProfileAsync(StudentProfileViewModel studentProfileViewModel)
        //{
        //    var userId = Request.GetUserId();

        //}

        #endregion

        [HttpPost("course_works/{courseWorkId}/apply")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> ApplyToCourseWork([FromBody] CreateApplicationViewModel createApplicationViewModel, long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }
            var userId = Request.GetUserId();
            if (courseWork.Applications.Count(app => app.StudentProfileId == userId) > 0)
            {
                return BadRequest();
            }

            var id = await _applicationsService.AddApplicationAsync(createApplicationViewModel, userId, courseWork);
            return Ok(id);
        }

        [HttpGet("applications/{appId}")]
        [ProducesResponseType(typeof(StudentApplicationDTO), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetStudentApplication(long appId)
        {
            var application = await _applicationsRepository.GetApplicationAsync(appId).ConfigureAwait(false);
            if (application == null)
            {
                return NotFound();
            }
            var userId = Request.GetUserId();
            if (application.StudentProfileId != userId)
            {
                return Forbid();
            }

            return Ok(_applicationsService.GetStudentApplication(application));
        }

        [HttpDelete("applications/{appId}")]
        public async Task<IActionResult> CancelApplicationToCourseWork(long appId)
        {
            var application = await _applicationsRepository.GetAsync(appId).ConfigureAwait(false);
            if (application == null)
            {
                return NotFound();
            }
            var userId = Request.GetUserId();
            if (application.StudentProfileId != userId)
            {
                return Forbid();
            }

            await _applicationsRepository.DeleteAsync(application.Id).ConfigureAwait(false);
            return Ok();
        }
    }
}
