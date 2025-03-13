using System.Net;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.ContentService.Client;
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

        public FilesController(IAuthServiceClient authServiceClient,
            IContentServiceClient contentServiceClient) : base(authServiceClient)
        {
            _contentServiceClient = contentServiceClient;
        }

        [HttpPost("upload")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.ServiceUnavailable)]
        public async Task<IActionResult> Upload([FromForm] UploadFileDTO uploadFileDto)
        {
            var result = await _contentServiceClient.UploadFileAsync(uploadFileDto);
            return result.Succeeded
                ? Ok() as IActionResult
                : StatusCode((int)HttpStatusCode.ServiceUnavailable, result.Errors);
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
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.ServiceUnavailable)]
        public async Task<IActionResult> GetFilesInfo(long courseId, [FromQuery] long? homeworkId = null)
        {
            var filesInfoResult = await _contentServiceClient.GetFilesInfo(courseId, homeworkId);
            return filesInfoResult.Succeeded
                ? Ok(filesInfoResult.Value) as IActionResult
                : StatusCode((int)HttpStatusCode.ServiceUnavailable, filesInfoResult.Errors);
        }

        [HttpDelete]
        [Authorize(Roles = Roles.LecturerRole)]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeleteFile([FromQuery] string key)
        {
            var deletionResult = await _contentServiceClient.DeleteFileAsync(key);
            return deletionResult.Succeeded
                ? Ok() as IActionResult
                : NotFound(deletionResult.Errors);
        }
    }
}