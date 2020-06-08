using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.CourseWorkService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
        private readonly IWorkFilesRepository _workFilesRepository;

        public CourseWorksController(IApplicationsService applicationsService, ICourseWorksService courseWorksService,
            ICourseWorksRepository courseWorksRepository, IWorkFilesRepository workFilesRepository)
        {
            _applicationsService = applicationsService;
            _courseWorksService = courseWorksService;
            _courseWorksRepository = courseWorksRepository;
            _workFilesRepository = workFilesRepository;
        }

        [HttpGet("available")]
        [ProducesResponseType(typeof(OverviewCourseWorkDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAvailableCourseWorks()
        {
            var courseWorks = await _courseWorksService
                .GetActiveFilteredCourseWorksAsync(courseWork => courseWork.StudentId == null)
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
                .GetFilteredCourseWorksWithStatusAsync(status,
                    courseWork => courseWork.StudentId == userId || courseWork.LecturerId == userId)
                .ConfigureAwait(false);
            return Ok(courseWorks);
        }

        [Authorize]
        [HttpGet("{courseWorkId}/deadlines")]
        [ProducesResponseType(typeof(DeadlineDTO[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseWorksDeadlines(long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId).ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }

            var userId = Request.GetUserId();

            return Ok(_courseWorksService.GetCourseWorkDeadlines(userId, courseWork));
        }

        [Authorize]
        [HttpGet("applications/{status}")]
        [ProducesResponseType(typeof(OverviewApplicationDTO[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> GetApplications(string status)
        {
            if (status != "active")
            {
                return NotFound();
            }

            var userId = Request.GetUserId();
            var applications = await _applicationsService
                .GetFilteredApplicationsAsync(app => app.StudentProfileId == userId || app.CourseWork.LecturerId == userId)
                .ConfigureAwait(false);
            return Ok(applications);
        }

        [Authorize]
        [HttpPost("{courseWorkId}/files/{type}")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddFile(IFormFile file, string type, long courseWorkId)
        {
            var userId = Request.GetUserId();
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId)
                .ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }
            if (type != "CourseWork" && type != "Presentation" && type != "Report" 
                || courseWork.WorkFiles.Select(c => c.Type).Contains(type))
            {
                return BadRequest();
            }
            if (userId != courseWork.StudentId && userId != courseWork.LecturerId)
            {
                return Forbid();
            }
            var workFile = new WorkFile
            {
                FileName = file.FileName,
                FileType = file.ContentType,
                CourseWork = courseWork,
                Type = type
            };

            using (var binaryReader = new BinaryReader(file.OpenReadStream()))
            {
                workFile.Data = binaryReader.ReadBytes((int)file.Length);
            }

            return Ok(await _workFilesRepository.AddAsync(workFile));
        }

        [Authorize]
        [HttpDelete("{courseWorkId}/files/{type}")]
        public async Task<IActionResult> DeleteFile(string type, long courseWorkId)
        {
            var userId = Request.GetUserId();
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId)
                .ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }
            if (type != "CourseWork" && type != "Presentation" && type != "report" 
            || !courseWork.WorkFiles.Select(c => c.Type).Contains(type))
            {
                return BadRequest();
            }
            if (userId != courseWork.StudentId && userId != courseWork.LecturerId)
            {
                return Forbid();
            }

            var workFile = courseWork.WorkFiles.Find(file => file.Type == type);
            await _workFilesRepository.DeleteAsync(workFile.Id).ConfigureAwait(false);
            return Ok();
        }

        [HttpGet("{courseWorkId}/files/{type}")]
        [ProducesResponseType(typeof(FileContentResult), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCourseWorkFile(string type, long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId)
                .ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }
            if (type != "CourseWork" && type != "Presentation" && type != "report"
                || !courseWork.WorkFiles.Select(c => c.Type).Contains(type))
            {
                return BadRequest();
            }

            var workFile = courseWork.WorkFiles.Find(file => file.Type == type);
            return File(workFile.Data, workFile.FileType, workFile.FileName);
        }
    }
}