using System.Linq;
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
    private readonly FilesCountLimit _countFilter;

    public FilesController(IAuthServiceClient authServiceClient,
        IContentServiceClient contentServiceClient,
        FilesPrivacyFilter privacyFilter, FilesCountLimit countFilter) : base(authServiceClient)
    {
        _contentServiceClient = contentServiceClient;
        _privacyFilter = privacyFilter;
        _countFilter = countFilter;
    }

    [HttpPost("process")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.Forbidden)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.ServiceUnavailable)]
    public async Task<IActionResult> Process([FromForm] ProcessFilesDTO processFilesDto)
    {
        var checkRights = await _privacyFilter.CheckUploadRights(
            User.Claims.FirstOrDefault(claim => claim.Type.ToString() == "_id")?.Value,
            processFilesDto.FilesScope);
        if (!checkRights) return Forbid("Недостаточно прав для загрузки файлов");

        var checkCountLimit = await _countFilter.CheckCountLimit(processFilesDto);
        if (!checkCountLimit) return StatusCode((int)HttpStatusCode.Forbidden, "Слишком много файлов в решении." 
            + $"Максимальное количество файлов - ${_countFilter.maxSolutionFiles}");
        
        var result = await _contentServiceClient.ProcessFilesAsync(processFilesDto);
        return result.Succeeded
            ? Ok()
            : StatusCode((int)HttpStatusCode.ServiceUnavailable, result.Errors);
    }

    [HttpPost("statuses")]
    [ProducesResponseType((int)HttpStatusCode.Forbidden)]
    [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.ServiceUnavailable)]
    public async Task<IActionResult> GetStatuses(ScopeDTO filesScope)
    {
        var checkRights = await _privacyFilter.CheckUploadRights(
            User.Claims.FirstOrDefault(claim => claim.Type.ToString() == "_id")?.Value,
            filesScope);
        if (!checkRights) return Forbid("Недостаточно прав для получения информации о файлах");
        
        var filesStatusesResult = await _contentServiceClient.GetFilesStatuses(filesScope);
        return filesStatusesResult.Succeeded
            ? Ok(filesStatusesResult.Value) as IActionResult
            : StatusCode((int)HttpStatusCode.ServiceUnavailable, filesStatusesResult.Errors);
    }

    [HttpGet("downloadLink")]
    [ProducesResponseType((int)HttpStatusCode.Forbidden)]
    [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetDownloadLink([FromQuery] long fileId)
    {
        var linkDto = await _contentServiceClient.GetDownloadLinkAsync(fileId);
        if(!linkDto.Succeeded) return StatusCode((int)HttpStatusCode.ServiceUnavailable, linkDto.Errors);

        var userId = User.Claims.FirstOrDefault(claim => claim.Type.ToString() == "_id")?.Value;
        var hasRights = false;
        foreach (var scope in linkDto.Value.fileScopes)
        {
            if (await _privacyFilter.CheckDownloadRights(userId, scope))
            {
                hasRights = true;
                break;
            }
        }

        return hasRights
            ? Ok(linkDto.Value.DownloadUrl)
            : Forbid("Недостаточно прав для получения ссылки на файл");
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
