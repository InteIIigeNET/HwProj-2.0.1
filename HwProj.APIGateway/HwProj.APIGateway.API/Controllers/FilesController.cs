using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Filters;
using HwProj.AuthService.Client;
using HwProj.ContentService.Client;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers;

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
    [Authorize(Roles = Roles.LecturerOrStudentRole)]
    [ServiceFilter(typeof(CourseMentorOrSolutionStudentAttribute))]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.ServiceUnavailable)]
    public async Task<IActionResult> Process([FromForm] ProcessFilesDTO processFilesDto)
    {
        var result = await _contentServiceClient.ProcessFilesAsync(processFilesDto);
        return result.Succeeded
            ? Ok()
            : StatusCode((int)HttpStatusCode.ServiceUnavailable, result.Errors);
    }

    [HttpPost("statuses")]
    [Authorize(Roles = Roles.LecturerOrStudentRole)]
    [ServiceFilter(typeof(SolutionPrivacyAttribute))]
    [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.ServiceUnavailable)]
    public async Task<IActionResult> GetStatuses(ScopeDTO filesScope)
    {
        var filesStatusesResult = await _contentServiceClient.GetFilesStatuses(filesScope);
        return filesStatusesResult.Succeeded
            ? Ok(filesStatusesResult.Value) as IActionResult
            : StatusCode((int)HttpStatusCode.ServiceUnavailable, filesStatusesResult.Errors);
    }

    [HttpPost("downloadLink")]
    [ServiceFilter(typeof(SolutionPrivacyAttribute))]
    [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetDownloadLink([FromForm] FileScopeDTO fileScope)
    {
        var result = await _contentServiceClient.GetDownloadLinkAsync(fileScope.FileId);
        return result.Succeeded
            ? Ok(result.Value)
            : NotFound(result.Errors);
    }

    [HttpGet("info/course/{courseId}")]
    [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.ServiceUnavailable)]
    public async Task<IActionResult> GetFilesInfo(long courseId)
    {
        var filesInfoResult = await _contentServiceClient.GetFilesInfo(courseId);
        return filesInfoResult.Succeeded
            ? Ok(filesInfoResult.Value) as IActionResult
            : StatusCode((int)HttpStatusCode.ServiceUnavailable, filesInfoResult.Errors);
    }

    [HttpGet("info/course/{courseId}/uploaded")]
    [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.ServiceUnavailable)]
    public async Task<IActionResult> GetUploadedFilesInfo(long courseId)
    {
        var filesInfoResult = await _contentServiceClient.GetUploadedFilesInfo(courseId);
        return filesInfoResult.Succeeded
            ? Ok(filesInfoResult.Value) as IActionResult
            : StatusCode((int)HttpStatusCode.ServiceUnavailable, filesInfoResult.Errors);
    }
}
