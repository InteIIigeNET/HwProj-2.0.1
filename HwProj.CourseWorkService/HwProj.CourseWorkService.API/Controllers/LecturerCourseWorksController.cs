using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Exceptions;
using HwProj.CourseWorkService.API.Filters;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.UserInfo;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [Route("api/lecturer")]
    [TypeFilter(typeof(OnlySelectRoleAttribute), Arguments = new object[] { RoleTypes.Lecturer })]
    [TypeFilter(typeof(CommonExceptionFilterAttribute), 
        Arguments = new object[] { new [] { typeof(ForbidException), typeof(ObjectNotFoundException), typeof(BadRequestException) }})]
    [ApiController]
    public class LecturerCourseWorksController : ControllerBase
    {
        #region Fields: Private

        private readonly IApplicationsService _applicationsService;
        private readonly ICourseWorksService _courseWorksService;
        private readonly ICourseWorksRepository _courseWorksRepository;
        private readonly IDeadlineRepository _deadlineRepository;
        private readonly IUserService _userService;

        #endregion

        #region Constructors: Public

        public LecturerCourseWorksController(IApplicationsService applicationsService,
            ICourseWorksService courseWorksService, ICourseWorksRepository courseWorksRepository,
            IDeadlineRepository deadlineRepository, IUserService userService)
        {
            _applicationsService = applicationsService;
            _courseWorksService = courseWorksService;
            _courseWorksRepository = courseWorksRepository;
            _deadlineRepository = deadlineRepository;
            _userService = userService;
        }

        #endregion

        #region Methods: Public

        [HttpPost("course_works/add")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddCourseWorkAsync([FromBody] CreateCourseWorkViewModel createCourseWorkViewModel)
        {
            var userId = Request.GetUserId();
            var id = await _courseWorksService.AddCourseWorkAsync(createCourseWorkViewModel, userId, false);
            return Ok(id);
        }

        [HttpDelete("course_works/{courseWorkId}")]
        public async Task<IActionResult> DeleteCourseWorkAsync(long courseWorkId)
        {
            var userId = Request.GetUserId();
            await _courseWorksService.DeleteCourseWorkAsync(courseWorkId, userId);
            return Ok();
        }

        [HttpPut("course_works/{courseWorkId}")]
        public async Task<IActionResult> UpdateCourseWorkAsync([FromBody] CreateCourseWorkViewModel createCourseWorkViewModel, long courseWorkId)
        {
            var userId = Request.GetUserId();
            await _courseWorksService.UpdateCourseWorkAsync(courseWorkId, userId, createCourseWorkViewModel)
                .ConfigureAwait(false);
            return Ok();
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfileAsync([FromBody] LecturerProfileViewModel lecturerProfileViewModel)
        {
            var userId = Request.GetUserId();
            await _userService.UpdateUserRoleProfile<LecturerProfile, LecturerProfileViewModel>(userId, lecturerProfileViewModel)
                .ConfigureAwait(false);
            return Ok();
        }

        [HttpGet("applications/{appId}")]
        [ProducesResponseType(typeof(LecturerApplicationDTO), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetLecturerApplication(long appId)
        {
            var userId = Request.GetUserId();
            var lecturerApplicationDTO = await _applicationsService.GetApplicationForLecturerAsync(userId, appId)
                .ConfigureAwait(false);
            return Ok(lecturerApplicationDTO);
        }

        [HttpGet("course_works/{courseWorkId}/applications")]
        [ProducesResponseType(typeof(OverviewApplicationDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseWorkApplications(long courseWorkId)
        {
            //var courseWork = await _courseWorksRepository.GetAsync(courseWorkId).ConfigureAwait(false);
            //if (courseWork == null)
            //{
            //    return NotFound();
            //}

            var applications = await _applicationsService
                .GetFilteredApplicationsAsync(app => app.CourseWorkId == courseWorkId)
                .ConfigureAwait(false);
            return Ok(applications);
        }

        [HttpPost("applications/{appId}/accept")]
        public async Task<IActionResult> AcceptStudent(long appId)
        {
            var userId = Request.GetUserId();
            await _applicationsService.AcceptStudentApplicationAsync(userId, appId);
            return Ok();
        }

        [HttpDelete("applications/{appId}/reject")]
        public async Task<IActionResult> RejectStudent(long appId)
        {
            var userId = Request.GetUserId();
            await _applicationsService.RejectApplicationAsync(userId, appId);
            return Ok();
        }

        [HttpDelete("course_works/{courseWorkId}/exclude")]
        public async Task<IActionResult> ExcludeStudent(long courseWorkId)
        {
            var userId = Request.GetUserId();
            await _courseWorksService.ExcludeStudentAsync(userId, courseWorkId);
            return Ok();
        }

        #endregion

        [HttpPost("course_works/{courseWorkId}/deadlines")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddDeadline([FromBody] AddDeadlineViewModel addDeadlineViewModel, long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            var userId = Request.GetUserId();
            if (courseWork == null)
            {
                return NotFound();
            }

            if (courseWork.Deadlines.Count(d => d.Type == addDeadlineViewModel.Type) > 0)
            {
                return BadRequest();
            }

            if (userId != courseWork.LecturerId)
            {
                return Forbid();
            }

            var id = await _courseWorksService.AddDeadlineAsync(addDeadlineViewModel, courseWork)
                .ConfigureAwait(false);
            return Ok(id);
        }

        [HttpPut("course_works/{courseWorkId}/deadlines")]
        public async Task<IActionResult> UpdateDeadline([FromBody] AddDeadlineViewModel addDeadlineViewModel, long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }

            var oldDeadline = courseWork.Deadlines.FirstOrDefault(d => d.Type == addDeadlineViewModel.Type);
            var userId = Request.GetUserId();
            if (oldDeadline == null)
            {
                return BadRequest();
            }

            if (userId != courseWork.LecturerId)
            {
                return Forbid();
            }


            await _deadlineRepository.UpdateAsync(oldDeadline.Id, d => new Deadline()
            {
                Type = addDeadlineViewModel.Type,
                Date = DateTime.ParseExact(addDeadlineViewModel.Date, "dd/MM/yyyy", null)
            }).ConfigureAwait(false);
            return Ok();
        }

        [HttpDelete("course_works/{courseWorkId}/deadlines")]
        public async Task<IActionResult> DeleteDeadline([FromQuery] string type, long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }

            var oldDeadline = courseWork.Deadlines.FirstOrDefault(d => d.Type == type);
            var userId = Request.GetUserId();
            if (oldDeadline == null)
            {
                return BadRequest();
            }

            if (userId != courseWork.LecturerId)
            {
                return Forbid();
            }

            await _deadlineRepository.DeleteAsync(oldDeadline.Id).ConfigureAwait(false);
            return Ok();
        }
    }
}