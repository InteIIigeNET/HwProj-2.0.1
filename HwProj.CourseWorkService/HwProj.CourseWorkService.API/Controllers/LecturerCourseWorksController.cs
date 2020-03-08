using System;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerCourseWorksController : Controller
    {
        private readonly IApplicationService _applicationService;
        private readonly ICourseWorkService _courseWorkService;
        private readonly IDeadlineService _deadlineService;
        private readonly IUserService _userService;
        private readonly IMapper _mapper;

        public LecturerCourseWorksController(IApplicationService applicationService, ICourseWorkService courseWorkService,
            IDeadlineService deadlineService, IUserService userService, IMapper mapper)
        {
            _applicationService = applicationService;
            _courseWorkService = courseWorkService;
            _deadlineService = deadlineService;
            _userService = userService;
            _mapper = mapper;
        }

        [HttpGet("lecturer_course_works")]
        [ProducesResponseType(typeof(OverviewCourseWork[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetLecturerCourseWorksAsync()
        {
            var id = await _userService.GetIdByAuthId(Request.GetUserId()).ConfigureAwait(false);
            var courseWorks = await _courseWorkService
                .GetFilteredCourseWorksAsync(c => c.LecturerId == id)
                .ConfigureAwait(false);
            return Ok(_mapper.Map<OverviewCourseWork[]>(courseWorks));
        }

        [HttpPost("add_course_work")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddCourseWork([FromBody] CreateCourseWork createCourseWork)
        {
            var courseWork = _mapper.Map<CourseWork>(createCourseWork);
            courseWork.LecturerId = await _userService.GetIdByAuthId(Request.GetUserId()).ConfigureAwait(false);
            courseWork.CreationTime = DateTime.UtcNow;
            var id = await _courseWorkService.AddCourseWorkAsync(courseWork).ConfigureAwait(false);
            return Ok(id);
        }

        [HttpDelete("delete/{courseWorkId}")]
        public async Task<IActionResult> DeleteCourseWork(long courseWorkId)
        {
            await _courseWorkService.DeleteCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            return Ok();
        }

        [HttpPost("update_course_work/{courseWorkId}")]
        public async Task<IActionResult> UpdateCourseWorkAsync([FromBody] CreateCourseWork createCourseWork, long courseWorkId)
        {
            var courseWork = _mapper.Map<CourseWork>(createCourseWork);
            await _courseWorkService.UpdateCourseWorkAsync(courseWorkId, courseWork).ConfigureAwait(false);
            return Ok();
        }

        [HttpGet("applications/{courseWorkId}")]
        [ProducesResponseType(typeof(LecturerOverviewApplication[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseWorkApplications(long courseWorkId)
        {
            var applications = await _applicationService
                .GetFilteredApplicationsAsync(a => a.CourseWorkId == courseWorkId)
                .ConfigureAwait(false);
            var apps = _mapper.Map<LecturerOverviewApplication[]>(applications);
            for (var i = 0; i < apps.Length; i++)
            {
                apps[i].StudentName = applications[i].Student.Name;
            }
            return Ok(apps);
        }

        [HttpPost("accept_student/{courseWorkId}")]
        public async Task<IActionResult> AcceptStudent(long courseWorkId, [FromQuery] long studentId)
        {
            return await _courseWorkService.AcceptStudentAsync(courseWorkId, studentId).ConfigureAwait(false)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpPost("reject_student/{courseWorkId}")]
        public async Task<IActionResult> RejectStudent(long courseWorkId, [FromQuery] long studentId)
        {
            return await _courseWorkService.RejectStudentAsync(courseWorkId, studentId).ConfigureAwait(false)
                ? Ok()
                : NotFound() as IActionResult;
        }

        [HttpPost("add_deadline")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddDeadline([FromBody] AddDeadline addDeadline)
        {
            var deadline = _mapper.Map<Deadline>(addDeadline);
            deadline.CourseWork = await _courseWorkService.GetCourseWorkAsync(deadline.CourseWorkId)
                    .ConfigureAwait(false);
            var id = await _deadlineService.AddDeadlineAsync(deadline).ConfigureAwait(false);
            return Ok(id);
        }
    }
}