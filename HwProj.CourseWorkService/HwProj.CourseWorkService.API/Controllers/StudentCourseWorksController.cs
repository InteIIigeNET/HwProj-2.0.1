using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.CourseWorkService.API.Filters;
using Microsoft.AspNetCore.Mvc;
using HwProj.CourseWorkService.API.Models.DTO;
using HwProj.CourseWorkService.API.Models.ViewModels;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.CourseWorkService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Authorization;

namespace HwProj.CourseWorkService.API.Controllers
{
    [Authorize]
    [OnlyStudent]
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

            var id = await _applicationsService.AddApplicationAsync(createApplicationViewModel, userId);
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


        //[HttpPost("course_works/{courseWorkId}/add_file")]
        //[ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        //public async Task<IActionResult> AddFileOrReference([FromBody]AddFileOrReferenceViewModel addFileOrReferenceViewModel)
        //{
        //    var userId = Request.GetUserId();
        //    var courseWork = await _courseWorksRepository.GetAsync(addFileOrReferenceViewModel.CourseWorkId)
        //        .ConfigureAwait(false);
        //    if (userId != courseWork.StudentId && userId != courseWork.LecturerId)
        //    {
        //        return StatusCode(403);
        //    }
        //    var workFile = _mapper.Map<WorkFile>(addFileOrReferenceViewModel);
        //    workFile.CourseWork = courseWork;
        //    if (workFile.IsFile)
        //    {
        //        workFile.FileName = addFileOrReferenceViewModel.FData.FileName;
        //        workFile.FileType = addFileOrReferenceViewModel.FData.ContentType;

        //        using (var binaryReader = new BinaryReader(addFileOrReferenceViewModel.FData.OpenReadStream()))
        //        {
        //            workFile.Data = binaryReader.ReadBytes((int)addFileOrReferenceViewModel.FData.Length);
        //        }
        //    }
        //    return Ok(await _workFilesRepository.AddAsync(workFile));
        //}

        //[HttpDelete("course_works/{courseWorkId}/delete_file")]
        //public async Task<IActionResult> DeleteFile([FromQuery] string type, long courseWorkId)
        //{
        //    var workFile = await _workFilesRepository
        //        .FindAsync(file => file.CourseWorkId == courseWorkId && file.Type == type)
        //        .ConfigureAwait(false);
        //    await _workFilesRepository.DeleteAsync(workFile.Id).ConfigureAwait(false);
        //    return Ok();
        //}

        //[HttpGet("course_works/{courseWorkId}/get_file")]
        //[ProducesResponseType(typeof(FileContentResult), (int)HttpStatusCode.OK)]
        //public async Task<IActionResult> GetCourseWorkFile([FromQuery] string type, long courseWorkId)
        //{
        //    var workFile = await _workFilesRepository
        //        .FindAsync(file => file.CourseWorkId == courseWorkId && file.Type == type)
        //        .ConfigureAwait(false);
        //    return File(workFile.Data, workFile.FileType, workFile.FileName);
        //}

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
