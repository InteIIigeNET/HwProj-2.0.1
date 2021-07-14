using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Exceptions;
using HwProj.CourseWorkService.API.Filters;
using Microsoft.AspNetCore.Mvc;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Services.Interfaces;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [TypeFilter(typeof(OnlySelectRoleAttribute), Arguments = new object[] { Roles.Student })]
    [TypeFilter(typeof(CommonExceptionFilterAttribute),
        Arguments = new object[] { new[] { typeof(ObjectNotFoundException), typeof(ForbidException), typeof(BadRequestException) } })]
    [Route("api/student")]
    [ApiController]
    public class StudentCourseWorksController : ControllerBase
    {
        #region Fields: Private

        private readonly IApplicationsService _applicationsService;
        private readonly ICourseWorksService _courseWorksService;
        private readonly IUniversityService _universityService;
        private readonly IUserService _userService;

        #endregion

        #region Constructors: Public

        public StudentCourseWorksController(IApplicationsService applicationsService, 
            ICourseWorksService courseWorksService, IUniversityService universityService, IUserService userService)
        {
            _applicationsService = applicationsService;
            _courseWorksService = courseWorksService;
            _universityService = universityService;
            _userService = userService;
        }

        #endregion

        #region Methods: Public

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfileAsync([FromBody]StudentProfileViewModel studentProfileViewModel)
        {
            var userId = Request.GetUserId();
            await _userService.UpdateUserRoleProfile<StudentProfile, StudentProfileViewModel>(userId, studentProfileViewModel)
                .ConfigureAwait(false);
            return Ok();
        }

        [HttpGet("applications/{appId}")]
        [ProducesResponseType(typeof(StudentApplicationDTO), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetStudentApplication(long appId)
        {
            var userId = Request.GetUserId();
            var studentApplicationDTO = await _applicationsService.GetApplicationForStudentAsync(userId, appId)
                .ConfigureAwait(false);
            return Ok(studentApplicationDTO);
        }

        [HttpDelete("applications/{appId}")]
        public async Task<IActionResult> CancelApplicationToCourseWork(long appId)
        {
            var userId = Request.GetUserId();
            await _applicationsService.CancelApplicationAsync(userId, appId);
            return Ok();
        }

        [HttpPost("course_works/{courseWorkId}/apply")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> ApplyToCourseWork([FromBody] CreateApplicationViewModel createApplicationViewModel, long courseWorkId)
        {
	        var userId = Request.GetUserId();
	        var id = await _courseWorksService
		        .ApplyToCourseWorkAsync(userId, courseWorkId, createApplicationViewModel)
		        .ConfigureAwait(false);
	        return Ok(id);
        }

        [HttpGet("choice_theme_deadline")]
        [ProducesResponseType(typeof(DeadlineDTO[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> GetChoiceThemeDeadlineAsync()
        {
	        var userId = Request.GetUserId();
	        var deadlineDTO = await _universityService.GetChoiceThemeDeadlineAsync(userId).ConfigureAwait(false);
	        var result = new List<DeadlineDTO>();
	        if (deadlineDTO != null)
	        {
                result.Add(deadlineDTO);
	        }

	        return Ok(result);
        }

        [HttpPut("course_works/{courseWorkId}/set_updated_parameter")]
        public async Task<IActionResult> SetIsUpdatedInCourseWork(long courseWorkId)
        {
	        await _courseWorksService.SetIsUpdatedInCourseWork(courseWorkId, true).ConfigureAwait(false);
	        return Ok();
        }

        #endregion
    }
}
