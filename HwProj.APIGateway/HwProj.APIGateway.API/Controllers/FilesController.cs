using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Filters;
using HwProj.AuthService.Client;
using HwProj.ContentService.Client;
using HwProj.Models.ContentService.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers;

[Route("api/[controller]")]
[Authorize]
[ApiController]
public class FilesController : AggregationController
{
    private readonly IContentServiceClient _contentServiceClient;
    private readonly FilesPrivacyFilter _privacyFilter;

    public FilesController(IAuthServiceClient authServiceClient,
        IContentServiceClient contentServiceClient,
        FilesPrivacyFilter privacyFilter) : base(authServiceClient)
    {
        _contentServiceClient = contentServiceClient;
        _privacyFilter = privacyFilter;
    }

    [HttpPost("process")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.ServiceUnavailable)]
    public async Task<IActionResult> Process([FromForm] ProcessFilesDTO processFilesDto)
    {
        var isChecked = await _privacyFilter.CheckRights(User,
            processFilesDto.FilesScope.CourseId,
            processFilesDto.FilesScope.CourseUnitType,
            processFilesDto.FilesScope.CourseUnitId,
            FilesPrivacyFilter.Method.Upload
        );
        if (!isChecked) return BadRequest();
        
        var result = await _contentServiceClient.ProcessFilesAsync(processFilesDto);
        return result.Succeeded
            ? Ok()
            : StatusCode((int)HttpStatusCode.ServiceUnavailable, result.Errors);
    }

    [HttpPost("statuses")]
    [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.ServiceUnavailable)]
    public async Task<IActionResult> GetStatuses(ScopeDTO filesScope)
    {
        var isChecked = await _privacyFilter.CheckRights(User,
            filesScope.CourseId,
            filesScope.CourseUnitType,
            filesScope.CourseUnitId,
            FilesPrivacyFilter.Method.Upload
        );
        if (!isChecked) return BadRequest();
        
        var filesStatusesResult = await _contentServiceClient.GetFilesStatuses(filesScope);
        return filesStatusesResult.Succeeded
            ? Ok(filesStatusesResult.Value) as IActionResult
            : StatusCode((int)HttpStatusCode.ServiceUnavailable, filesStatusesResult.Errors);
    }

    [HttpGet("downloadLink")]
    [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetDownloadLink([FromQuery] long fileId)
    {
        var linkDto = await _contentServiceClient.GetDownloadLinkAsync(fileId);
        if(!linkDto.Succeeded) return NotFound(linkDto.Errors);

        var checkRights = await _privacyFilter.CheckRights(User,
            linkDto.Value.CourseId,
            linkDto.Value.CourseUnitType,
            linkDto.Value.CourseUnitId,
            FilesPrivacyFilter.Method.Download
        );

        return checkRights
            ? Ok(linkDto.Value.DownloadUrl)
            : BadRequest();
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
