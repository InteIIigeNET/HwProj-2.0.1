using System.Net;
using HwProj.ContentService.API.Extensions;
using HwProj.ContentService.API.Models.Enums;
using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Services.Interfaces;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Result;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.ContentService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IS3FilesService _s3FilesService;
    private readonly IMessageProducer _messageProducer;
    private readonly IFilesInfoService _filesInfoService;
    private readonly ILocalFilesService _localFilesService;
    private readonly IFileKeyService _fileKeyService;
    private readonly ILogger<FilesController> _logger;

    public FilesController(IS3FilesService s3FilesService, IMessageProducer messageProducer,
        IFilesInfoService filesInfoService, ILocalFilesService localFilesService, ILogger<FilesController> logger,
        IFileKeyService fileKeyService)
    {
        _s3FilesService = s3FilesService;
        _messageProducer = messageProducer;
        _filesInfoService = filesInfoService;
        _localFilesService = localFilesService;
        _logger = logger;
        _fileKeyService = fileKeyService;
    }

    [HttpPost("process")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    public async Task<IActionResult> Process([FromForm] ProcessFilesDTO processFilesDto)
    {
        var userId = Request.GetUserIdFromHeader();
        var scope = processFilesDto.FilesScope.ToScope();

        if (processFilesDto.DeletingFileIds.Count > 0)
            await _messageProducer.PushDeleteFilesMessages(scope, processFilesDto.DeletingFileIds, userId);

        if (processFilesDto.NewFiles.Count > 0)
        {
            var uploadFilesMessages = new List<UploadFileMessage>();
            foreach (var newFormFile in processFilesDto.NewFiles)
            {
                // Сохраняем файл локально
                var localFilePath = _fileKeyService.BuildServerFilePath(scope, newFormFile.FileName);
                await _localFilesService.SaveFile(newFormFile.OpenReadStream(), localFilePath);
                _logger.LogInformation("Файл {FileName} успешно сохранён в локальное хранилище по пути {localFilePath}",
                    newFormFile.FileName, localFilePath);

                var message = new UploadFileMessage(
                    Scope: processFilesDto.FilesScope.ToScope(),
                    LocalFilePath: localFilePath,
                    ContentType: newFormFile.ContentType,
                    OriginalName: newFormFile.FileName,
                    SizeInBytes: newFormFile.Length,
                    SenderId: userId
                );
                uploadFilesMessages.Add(message);
            }

            await _messageProducer.PushUploadFilesMessages(uploadFilesMessages);
        }

        return Ok();
    }

    [HttpPost("statuses")]
    [ProducesResponseType(typeof(List<FileInfoDTO>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetStatuses(ScopeDTO scopeDto)
    {
        var scope = scopeDto.ToScope();
        var filesStatuses = await _filesInfoService.GetFilesStatusesAsync(scope);
        return Ok(filesStatuses);
    }

    [HttpGet("downloadLink")]
    [ProducesResponseType(typeof(FileLinkDTO), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetDownloadLink([FromQuery] long fileId)
    {
        var externalKey = await _filesInfoService.GetFileExternalKeyAsync(fileId);
        if (externalKey is null) return Ok(Result<FileLinkDTO>.Failed("Файл не найден"));

        var fileScope = await _filesInfoService.GetFileScopeAsync(fileId);
        if (fileScope is null) return Ok(Result<FileLinkDTO>.Failed("Файл не найден"));
        
        var downloadUrl = await _s3FilesService.GetDownloadUrl(externalKey);
        if (!downloadUrl.Succeeded) return Ok(Result<FileLinkDTO>.Failed(downloadUrl.Errors));

        var result = new FileLinkDTO
        {
            DownloadUrl = downloadUrl.Value,
            CourseId = fileScope.CourseId,
            CourseUnitType = fileScope.CourseUnitType.ToString(),
            CourseUnitId = fileScope.CourseUnitId
        };

        return Ok(result);
    }

    [HttpGet("info/course/{courseId}")]
    [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetFilesInfo(long courseId)
    {
        var filesInfo = await _filesInfoService.GetFilesInfoAsync(courseId);
        return Ok(filesInfo);
    }

    [HttpGet("info/course/{courseId}/uploaded")]
    [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetUploadedFilesInfo(long courseId)
    {
        var filesInfo = await _filesInfoService.GetFilesInfoAsync(courseId, FileStatus.ReadyToUse);
        return Ok(filesInfo);
    }

    [HttpPost("transfer")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    public async Task<IActionResult> TransferFilesFromCourse(CourseFilesTransferDto filesTransferDto)
    {
        await _filesInfoService.TransferFilesFromCourse(filesTransferDto);
        return Ok();
    }
}
