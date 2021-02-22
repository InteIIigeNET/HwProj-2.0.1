using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.CourseWorkService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Route("api/course_works")]
    [ApiController]
    public class CourseWorksController : ControllerBase
    {
        private readonly IApplicationsService _applicationsService;
        private readonly ICourseWorksService _courseWorksService;
        private readonly ICourseWorksRepository _courseWorksRepository;

        public CourseWorksController(IApplicationsService applicationsService, ICourseWorksService courseWorksService,
            ICourseWorksRepository courseWorksRepository)
        {
            _applicationsService = applicationsService;
            _courseWorksService = courseWorksService;
            _courseWorksRepository = courseWorksRepository;
        }

        [HttpGet("available")]
        [ProducesResponseType(typeof(OverviewCourseWorkDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAvailableCourseWorks()
        {
            var courseWorks = await _courseWorksService
                .GetActiveFilteredCourseWorks(courseWork => courseWork.StudentId == null)
                .ConfigureAwait(false);
            return Ok(courseWorks);
        }

        [HttpGet("{courseWorkId}")]
        [ProducesResponseType(typeof(DetailCourseWorkDTO), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseWorkDetails(long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetAsync(courseWorkId)
                .ConfigureAwait(false);

            if (courseWork == null)
            {
                return NotFound();
            }

            return Ok(_courseWorksService.GetCourseWorkInfo(courseWork));
        }

        [Authorize]
        [HttpGet("my/{status}")]
        [ProducesResponseType(typeof(OverviewCourseWorkDTO[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> GetMyActiveCourseWork(string status)
        {
            if (status != "active" && status != "completed")
            {
                return NotFound();
            }

            var userId = Request.GetUserId();
            var courseWorks = await _courseWorksService
                .GetFilteredCourseWorksWithStatus(status,
                    courseWork => courseWork.StudentId == userId || courseWork.LecturerId == userId)
                .ConfigureAwait(false);
            return Ok(courseWorks);
        }

        [Authorize]
        [HttpGet("{courseWorkId}/deadlines")]
        [ProducesResponseType(typeof(DeadlineDTO[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseWorksDeadlines(long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetAsync(courseWorkId).ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }

            var userId = Request.GetUserId();

            return Ok(_courseWorksService.GetCourseWorkDeadlines(userId, courseWork));
        }

        [Authorize]
        [HttpGet("applications")]
        [ProducesResponseType(typeof(OverviewApplicationDTO[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> GetApplications()
        {
            var userId = Request.GetUserId();
            var applications = await _applicationsService
                .GetFilteredApplications(app => app.StudentId == userId || app.CourseWork.LecturerId == userId)
                .ConfigureAwait(false);
            return Ok(applications);
        }
    }
}