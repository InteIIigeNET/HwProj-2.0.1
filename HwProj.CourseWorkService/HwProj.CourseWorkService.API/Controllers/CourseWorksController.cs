using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Filters;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Interfaces;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Route("api/course_works")]
    [NotFoundExceptionFilter]
    [ApiController]
    public class CourseWorksController : ControllerBase
    {
        #region Fields: Private

        private readonly IApplicationsService _applicationsService;
        private readonly ICourseWorksService _courseWorksService;
        private readonly IUserService _userService;
        private readonly ICourseWorksRepository _courseWorksRepository;
        private readonly IWorkFilesRepository _workFilesRepository;
        private readonly IUsersRepository _usersRepository;

        #endregion

        #region Constructors: Public

        public CourseWorksController(IApplicationsService applicationsService, ICourseWorksService courseWorksService,
            ICourseWorksRepository courseWorksRepository, IWorkFilesRepository workFilesRepository,
            IUsersRepository usersRepository, IUserService userService)
        {
            _applicationsService = applicationsService;
            _courseWorksService = courseWorksService;
            _userService = userService;
            _courseWorksRepository = courseWorksRepository;
            _workFilesRepository = workFilesRepository;
            _usersRepository = usersRepository;
        }

        #endregion

        [HttpPost("test")]
        public async Task<IActionResult> SetAction()
        {
            var user = new User()
            {
                Id = "fb952574-de89-4365-9a76-424e6489b558",
                UserName = "Test",
                Email = "wef@Test"
            };

            await _usersRepository.AddAsync(user).ConfigureAwait(false);
            await _usersRepository.AddRoleAsync(user.Id, RoleNames.Lecturer).ConfigureAwait(false);
            await _usersRepository.AddRoleAsync(user.Id, RoleNames.Curator).ConfigureAwait(false);
            return Ok();
        }

        #region Methods: Public

        [HttpGet("available")]
        [ProducesResponseType(typeof(OverviewCourseWorkDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAvailableCourseWorks()
        {
            var courseWorks = await _courseWorksService
                .GetFilteredCourseWorksAsync(courseWork => courseWork.StudentId == null && !courseWork.IsCompleted)
                .ConfigureAwait(false);
            return Ok(courseWorks);
        }

        [Authorize]
        [HttpGet("{role}/my/{status}")]
        [ProducesResponseType(typeof(OverviewCourseWorkDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetMyActiveCourseWork(string role, string status)
        {
            if (status != "active" && status != "completed" || !Enum.TryParse<RoleNames>(role, out var roleName))
            {
                return NotFound();
            }

            var userId = Request.GetUserId();
            var courseWorks = await _courseWorksService
                .GetFilteredCourseWorksAsync(courseWork => courseWork.IsCompleted == (status == "completed") && 
                    roleName == RoleNames.Student ? courseWork.StudentId == userId :
                    roleName == RoleNames.Lecturer ? courseWork.LecturerId == userId :
                    roleName == RoleNames.Reviewer ? courseWork.ReviewerId == userId :
                    courseWork.CuratorId == userId)
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
            var directionsDTO = await _userService.GetDirectionsAsync().ConfigureAwait(false);
            return Ok(directionsDTO);
        }

        //TODO
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
            if (userId != courseWork.StudentId && userId != courseWork.LecturerId
                || type == "Review" && userId != courseWork.ReviewerId)
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
            if (type != "CourseWork" && type != "Presentation" && type != "Report" 
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
            if (type != "CourseWork" && type != "Presentation" && type != "Report"
                || !courseWork.WorkFiles.Select(c => c.Type).Contains(type))
            {
                return BadRequest();
            }

            var workFile = courseWork.WorkFiles.Find(file => file.Type == type);
            return File(workFile.Data, workFile.FileType, workFile.FileName);
        }

        [HttpGet("{courseWorkId}/files")]
        [ProducesResponseType(typeof(WorkFileDTO[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> GetFilesInfo(long courseWorkId)
        {
            var courseWork = await _courseWorksRepository.GetCourseWorkAsync(courseWorkId)
                .ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }

            return Ok(_courseWorksService.GetWorkFilesDTO(courseWork.WorkFiles.ToArray()));
        }

        [Authorize]
        [HttpPost("{courseWorkId}/reference")]
        public async Task<IActionResult> AddReference([FromBody]string reference, long courseWorkId)
        {
            var userId = Request.GetUserId();
            var courseWork = await _courseWorksRepository.GetAsync(courseWorkId)
                .ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }
            if (userId != courseWork.StudentId && userId != courseWork.LecturerId)
            {
                return Forbid();
            }

            await _courseWorksRepository.UpdateAsync(courseWorkId,
                x => new CourseWork()
                {
                    Reference = reference
                }).ConfigureAwait(false);

            return Ok();
        }

        [Authorize]
        [HttpDelete("{courseWorkId}/reference")]
        public async Task<IActionResult> DeleteReference(long courseWorkId)
        {
            var userId = Request.GetUserId();
            var courseWork = await _courseWorksRepository.GetAsync(courseWorkId)
                .ConfigureAwait(false);
            if (courseWork == null)
            {
                return NotFound();
            }
            if (userId != courseWork.StudentId && userId != courseWork.LecturerId)
            {
                return Forbid();
            }

            await _courseWorksRepository.UpdateAsync(courseWorkId,
                x => new CourseWork()
                {
                    Reference = null
                }).ConfigureAwait(false);

            return Ok();
        }

        [Authorize]
        [HttpPost("reviewers/new")]
        public async Task<IActionResult> BecomeReviewer()
        {
            var userId = Request.GetUserId();
            var roles = await _usersRepository.GetRoles(userId).ConfigureAwait(false);
            if (!roles.Contains(RoleNames.Reviewer))
            {
                await _usersRepository.AddRoleAsync(userId, RoleNames.Reviewer).ConfigureAwait(false);
            }

            return Ok();
        }

        #endregion
    }
}