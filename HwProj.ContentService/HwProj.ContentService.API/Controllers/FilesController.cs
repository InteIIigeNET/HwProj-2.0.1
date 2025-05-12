using System.Net;
using HwProj.ContentService.API.Extensions;
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
    private readonly ILogger<FilesController> _logger;

    public FilesController(IS3FilesService s3FilesService, IMessageProducer messageProducer,
        IFilesInfoService filesInfoService, ILocalFilesService localFilesService, ILogger<FilesController> logger)
    {
        _s3FilesService = s3FilesService;
        _messageProducer = messageProducer;
        _filesInfoService = filesInfoService;
        _localFilesService = localFilesService;
        _logger = logger;
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
                var localFilePath = await _localFilesService.SaveFile(newFormFile, scope);
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
    [ProducesResponseType(typeof(List<FileStatusDTO>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetStatuses(ScopeDTO scopeDto)
    {
        var scope = scopeDto.ToScope();
        var filesStatuses = await _filesInfoService.GetFilesStatusesAsync(scope);
        return Ok(filesStatuses);
    }

    [HttpGet("downloadLink")]
    [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetDownloadLink([FromQuery] long fileId)
    {
        var externalKey = await _filesInfoService.GetFileExternalKeyAsync(fileId);
        if (externalKey is null) return Ok(Result<string>.Failed("Файл не найден"));
        
        var downloadUrlResult = await _s3FilesService.GetDownloadUrl(externalKey);
        return Ok(downloadUrlResult);
    }

    [HttpGet("info/course/{courseId}")]
    [ProducesResponseType(typeof(FileInfoDTO[]), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetFilesInfo(long courseId)
    {
        var filesInfo = await _filesInfoService.GetFilesInfoAsync(courseId);
        return Ok(filesInfo);
    }
}