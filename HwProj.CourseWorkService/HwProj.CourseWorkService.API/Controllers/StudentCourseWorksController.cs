using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Filters;
using HwProj.CourseWorkService.API.Models;
using Microsoft.AspNetCore.Mvc;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.CourseWorkService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace HwProj.CourseWorkService.API.Controllers
{
    //[Authorize]
    //[OnlyStudent]
    [Route("api/student")]
    [ApiController]
    public class StudentCourseWorksController : Controller
    {
        private readonly IApplicationsService _applicationsService;
        private readonly IApplicationsRepository _applicationsRepository;
        private readonly ICourseWorksRepository _courseWorksRepository;

        public StudentCourseWorksController(IApplicationsService applicationsService,
            IApplicationsRepository applicationsRepository, ICourseWorksRepository courseWorksRepository)
        {
            _applicationsService = applicationsService;
            _applicationsRepository = applicationsRepository;
            _courseWorksRepository = courseWorksRepository;
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

        //[HttpPost("become_reviewer")]
        //public async Task<IActionResult> BecomeReviewer()
        //{
        //    var user = await _usersRepository.GetAsync(Request.GetUserId())
        //        .ConfigureAwait(false);
        //    user.Roles[1] = "Reviewer";
        //    return Ok();
        //}
    }
}
