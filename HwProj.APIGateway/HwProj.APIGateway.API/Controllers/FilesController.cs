using System.Linq;
using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.ContentService.Client;
using HwProj.CoursesService.Client;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class FilesController : AggregationController
    {
        private readonly IContentServiceClient _contentServiceClient;
        private readonly ICoursesServiceClient _coursesServiceClient;

        public FilesController(IAuthServiceClient authServiceClient,
            IContentServiceClient contentServiceClient,
            ICoursesServiceClient coursesServiceClient) : base(authServiceClient)
        {
            _contentServiceClient = contentServiceClient;
            _coursesServiceClient = coursesServiceClient;
        }

        [HttpPost("upload")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Upload([FromForm] UploadFileDTO uploadFileDto)
        {
            var courseLecturersIds = await _coursesServiceClient.GetCourseLecturersIds(uploadFileDto.CourseId);
            if (!courseLecturersIds.Contains(UserId))
                return BadRequest("Пользователь с такой почтой не является преподавателем курса");

            var result = await _contentServiceClient.UploadFileAsync(uploadFileDto);
            return result.Succeeded ? Ok() as IActionResult : BadRequest(result.Errors);
        }

        [HttpGet("downloadLink")]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> GetDownloadLink([FromQuery] string key)
        {
            var result = await _contentServiceClient.GetDownloadLinkAsync(key);
            return result.Succeeded
                ? Ok(result.Value) as IActionResult
                : NotFound(result.Errors);
        }

        [HttpGet("filesInfo/{courseId}")]
        [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetFilesInfo(long courseId, [FromQuery] long? homeworkId = null)
        {
            var filesInfo = await _contentServiceClient.GetFilesInfo(courseId, homeworkId);
            return Ok(filesInfo);
        }

        [HttpDelete]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeleteFile([FromQuery] string key)
        {
            var courseIdResult = await _contentServiceClient.GetCourseIdFromKeyAsync(key);
            if (!courseIdResult.Succeeded) return BadRequest(courseIdResult.Errors);

            var courseLecturersIds = await _coursesServiceClient.GetCourseLecturersIds(courseIdResult.Value);
            if (!courseLecturersIds.Contains(UserId))
                return BadRequest("Пользователь с такой почтой не является преподавателем курса");

            var deletionResult = await _contentServiceClient.DeleteFileAsync(key);
            return deletionResult.Succeeded
                ? Ok() as IActionResult
                : NotFound(deletionResult.Errors);
        }
    }
}