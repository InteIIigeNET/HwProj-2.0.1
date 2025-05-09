using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Filters;
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

        [HttpPost("process")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.ServiceUnavailable)]
        public async Task<IActionResult> Process([FromForm] ProcessFilesDTO processFilesDto)
        {
            var result = await _contentServiceClient.ProcessFilesAsync(processFilesDto);
            return result.Succeeded
                ? Ok() as IActionResult
                : StatusCode((int)HttpStatusCode.ServiceUnavailable, result.Errors);
        }

        [HttpGet("statuses")]
        [Authorize(Roles = Roles.LecturerRole)]
        [ServiceFilter(typeof(CourseMentorOnlyAttribute))]
        [ProducesResponseType(typeof(List<FileStatusDTO>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetStatuses(ScopeDTO scopeDto)
        {
            var filesStatuses = await _contentServiceClient.GetFilesStatuses(scopeDto);
            return Ok(filesStatuses);
        }
        
        [HttpGet("downloadLink")]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> GetDownloadLink([FromQuery] long fileId)
        {
            var result = await _contentServiceClient.GetDownloadLinkAsync(fileId);
            return result.Succeeded
                ? Ok(result.Value) as IActionResult
                : NotFound(result.Errors);
        }

        [HttpGet("info/course/{courseId}")]
        [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetFilesInfo(long courseId)
        {
            var filesInfo = await _contentServiceClient.GetFilesInfo(courseId);
            return Ok(filesInfo);
        }
    }
}