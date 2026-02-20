using System.Net;
using System.Threading.Tasks;
using HwProj.APIGateway.API.Filters;
using HwProj.AuthService.Client;
using HwProj.ContentService.Client;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.CourseUnitType;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.APIGateway.API.Controllers;

[Route("api/[controller]")]
[Authorize]
[ApiController]
public class FilesController(
    IAuthServiceClient authServiceClient,
    IContentServiceClient contentServiceClient,
    FilesPrivacyFilter privacyFilter,
    FilesCountLimiter filesCountLimiter)
    : AggregationController(authServiceClient)
{
    [HttpPost("process")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.Forbidden)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> Process([FromForm] ProcessFilesDTO processFilesDto)
    {
        var checkRights = await privacyFilter.CheckUploadRights(UserId, processFilesDto.FilesScope);
        if (!checkRights) return Forbid("Недостаточно прав для загрузки файлов");

        var checkCountLimit = await filesCountLimiter.CheckCountLimit(processFilesDto);
        if (!checkCountLimit)
            return Forbid("Слишком много файлов в решении." +
                          $"Максимальное количество файлов - ${FilesCountLimiter.MaxSolutionFiles}");

        var result = await contentServiceClient.ProcessFilesAsync(processFilesDto);
        return result.Succeeded
            ? Ok()
            : BadRequest(result.Errors);
    }

    [HttpPost("statuses")]
    [ProducesResponseType((int)HttpStatusCode.Forbidden)]
    [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> GetStatuses(ScopeDTO filesScope)
    {
        var checkRights = await privacyFilter.CheckUploadRights(UserId, filesScope);
        if (!checkRights) return Forbid("Недостаточно прав для получения информации о файлах");

        var result = await contentServiceClient.GetFilesStatuses(filesScope);
        return result.Succeeded
            ? Ok(result.Value)
            : BadRequest(result.Errors);
    }

    [HttpGet("downloadLink")]
    [ProducesResponseType((int)HttpStatusCode.Forbidden)]
    [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetDownloadLink([FromQuery] long fileId)
    {
        var linkDto = await contentServiceClient.GetDownloadLinkAsync(fileId);
        if (!linkDto.Succeeded) return BadRequest(linkDto.Errors);

        var result = linkDto.Value;
        var userId = UserId;

        foreach (var scope in result.FileScopes)
        {
            if (await privacyFilter.CheckDownloadRights(userId, scope))
                return Ok(result.DownloadUrl);
        }

        return Forbid("Недостаточно прав для получения ссылки на файл");
    }

    [HttpGet("info/course/{courseId}")]
    [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(string[]), (int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> GetFilesInfo(long courseId,
        [FromQuery] bool uploadedOnly = true,
        [FromQuery] string courseUnitType = CourseUnitType.Homework)
    {
        var filesInfoResult = await contentServiceClient.GetFilesInfo(courseId, uploadedOnly, courseUnitType);
        return filesInfoResult.Succeeded
            ? Ok(filesInfoResult.Value)
            : BadRequest(filesInfoResult.Errors);
    }
}
