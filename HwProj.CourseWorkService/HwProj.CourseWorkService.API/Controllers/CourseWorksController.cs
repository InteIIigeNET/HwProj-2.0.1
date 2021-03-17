using System;
using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Exceptions;
using HwProj.CourseWorkService.API.Filters;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Services.Interfaces;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Route("api/course_works")]
    [TypeFilter(typeof(CommonExceptionFilterAttribute),
        Arguments = new object[] { new [] { typeof(ObjectNotFoundException), typeof(ForbidException) }})]
    [ApiController]
    public class CourseWorksController : ControllerBase
    {
        #region Fields: Private

        private readonly IApplicationsService _applicationsService;
        private readonly ICourseWorksService _courseWorksService;
        private readonly IUniversityService _universityService;
        private readonly IUserService _userService;

        #endregion

        #region Constructors: Public

        public CourseWorksController(IApplicationsService applicationsService, ICourseWorksService courseWorksService,
            IUniversityService universityService, IUserService userService)
        {
            _applicationsService = applicationsService;
            _courseWorksService = courseWorksService;
            _universityService = universityService;
            _userService = userService;
        }

        #endregion

        #region Methods: Public

        [HttpGet("available")]
        [ProducesResponseType(typeof(OverviewCourseWorkDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAvailableCourseWorks()
        {
            var courseWorks = await _courseWorksService
                .GetFilteredCourseWorksAsync(courseWork => courseWork.StudentProfileId == null && !courseWork.IsCompleted)
                .ConfigureAwait(false);
            return Ok(courseWorks);
        }

        [Authorize]
        [HttpGet("{roleString}/my/{status}")]
        [ProducesResponseType(typeof(OverviewCourseWorkDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetMyActiveCourseWork(string roleString, string status)
        {
            if (status != "active" && status != "completed" || !Enum.TryParse<Roles>(roleString, out var role))
            {
                return NotFound();
            }

            var userId = Request.GetUserId();
            var courseWorks = await _courseWorksService
                .GetFilteredCourseWorksAsync(courseWork => courseWork.IsCompleted == (status == "completed") && 
                    role == Roles.Student ? courseWork.StudentProfileId == userId :
                    role == Roles.Lecturer ? courseWork.LecturerProfileId == userId && !courseWork.CreatedByCurator :
                    role == Roles.Reviewer ? courseWork.ReviewerProfileId == userId :
                    courseWork.CuratorProfileId == userId)
                .ConfigureAwait(false);
            return Ok(courseWorks);
        }

        [HttpGet("{courseWorkId}")]
        [ProducesResponseType(typeof(DetailCourseWorkDTO), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseWorkDetails(long courseWorkId)
        {
            return Ok(await _courseWorksService.GetCourseWorkInfoAsync(courseWorkId).ConfigureAwait(false));
        }

        [HttpGet("directions")]
        [ProducesResponseType(typeof(DirectionDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetDirectionsAsync()
        {
            var directionsDTO = await _universityService.GetDirectionsAsync().ConfigureAwait(false);
            return Ok(directionsDTO);
        }

        [HttpGet("departments")]
        [ProducesResponseType(typeof(DepartmentDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetDepartmentsAsync()
        {
            var departmentsDTO = await _universityService.GetDepartmentsAsync().ConfigureAwait(false);
            return Ok(departmentsDTO);
        }

        [HttpGet("curators")]
        [ProducesResponseType(typeof(UserDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCuratorsAsync()
        {
            var usersDTO = await _userService.GetUsersByRoleAsync(Roles.Curator).ConfigureAwait(false);
            return Ok(usersDTO);
        }

        [Authorize]
        [HttpGet("user/roles")]
        [ProducesResponseType(typeof(RoleDTO[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserRoles()
        {
            var userId = Request.GetUserId();
            var rolesDTO = await _userService.GetUserRoles(userId).ConfigureAwait(false);
            return Ok(rolesDTO);
        }

        [Authorize]
        [HttpGet("user/fullInfo")]
        [ProducesResponseType(typeof(UserFullInfoDTO), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserFullInfo()
        {
            var userId = Request.GetUserId();
            var userFullInfoDTO = await _userService.GetUserFullInfo(userId).ConfigureAwait(false);
            return Ok(userFullInfoDTO);
        }

        [Authorize]
        [HttpGet("applications/{status}")]
        [ProducesResponseType(typeof(OverviewApplicationDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetApplications(string status)
        {
            if (status != "active")
            {
                return NotFound();
            }

            var userId = Request.GetUserId();
            var applications = await _applicationsService
                .GetFilteredApplicationsAsync(app => app.StudentProfileId == userId || app.CourseWork.LecturerProfileId == userId)
                .ConfigureAwait(false);
            return Ok(applications);
        }

        [Authorize]
        [HttpPost("{courseWorkId}/reference")]
        public async Task<IActionResult> AddReference([FromBody] UpdateReferenceViewModel referenceViewModel, long courseWorkId)
        {
	        var userId = Request.GetUserId();
	        await _courseWorksService.UpdateReferenceInCourseWorkAsync(userId, courseWorkId, referenceViewModel.Reference)
		        .ConfigureAwait(false);
	        return Ok();
        }

        [Authorize]
        [HttpDelete("{courseWorkId}/reference")]
        public async Task<IActionResult> DeleteReference(long courseWorkId)
        {
	        var userId = Request.GetUserId();
	        await _courseWorksService.UpdateReferenceInCourseWorkAsync(userId, courseWorkId, remove: true);

	        return Ok();
        }

        [Authorize]
        [HttpPost("{courseWorkId}/files/{type}")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddFile(IFormFile file, string type, long courseWorkId)
        {
	        if (!Enum.TryParse<FileTypes>(type, out var fileType))
	        {
		        return NotFound();
	        }

	        if (file == null)
	        {
		        return BadRequest();
	        }

	        var userId = Request.GetUserId();
	        var id = await _courseWorksService.AddWorkFileToCourseWorkAsync(userId, courseWorkId, fileType, file);

	        return Ok(id);
        }

        [Authorize]
        [HttpDelete("{courseWorkId}/files/{fileId}")]
        public async Task<IActionResult> DeleteFile(long fileId, long courseWorkId)
        {
	        var userId = Request.GetUserId();
	        await _courseWorksService.RemoveWorkFileAsync(userId, courseWorkId, fileId).ConfigureAwait(false);
	        return Ok();
        }

        [HttpGet("{courseWorkId}/files/{fileId}")]
        [ProducesResponseType(typeof(FileContentResult), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> DownloadCourseWorkFile(long fileId, long courseWorkId)
        {
	        var workFile = await _courseWorksService.GetWorkFileAsync(courseWorkId, fileId).ConfigureAwait(false);
	        return File(workFile.Data, workFile.ContentType, workFile.FileName);
        }

        [HttpGet("{courseWorkId}/files")]
        [ProducesResponseType(typeof(WorkFileDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetFilesInfo(long courseWorkId)
        {
	        var workFilesDTO = await _courseWorksService.GetCourseWorkFilesAsync(courseWorkId).ConfigureAwait(false);
	        return Ok(workFilesDTO);
        }

        [HttpGet("{courseWorkId}/deadlines")]
        [ProducesResponseType(typeof(DeadlineDTO[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseWorkDeadlines(long courseWorkId)
        {
	        var userId = Request.GetUserId();
	        var deadlinesDTO = await _universityService.GetCourseWorkDeadlinesAsync(userId, courseWorkId)
		        .ConfigureAwait(false);
	        return Ok(deadlinesDTO);
        }

		[Authorize]
		[HttpPost("reviewers/new")]
		public async Task<IActionResult> BecomeReviewer()
		{
			var userId = Request.GetUserId();
			await _userService.AddReviewerRoleToUser(userId).ConfigureAwait(false);
			return Ok();
		}

		[Authorize]
		[HttpDelete("reviewers/remove")]
		public async Task<IActionResult> RemoveReviewerRole()
		{
			var userId = Request.GetUserId();
			await _userService.RemoveReviewerRole(userId).ConfigureAwait(false);
			return Ok();
		}

		#endregion
	}
}