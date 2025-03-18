using HwProj.ContentService.API.Services;
using HwProj.Models.ContentService.DTO;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.ContentService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IFilesService _filesService;

    public FilesController(IFilesService filesService)
    {
        _filesService = filesService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] UploadFileDTO uploadFileDto)
    {
        var userId = Request.GetUserIdFromHeader();
        var result = await _filesService.UploadFileAsync(uploadFileDto, userId);
        return Ok(result);
    }
    
    [HttpGet("downloadLink")]
    public async Task<IActionResult> GetDownloadLink([FromQuery] string key)
    {
        var downloadUrlResult = await _filesService.GetDownloadUrl(key);
        return Ok(downloadUrlResult);
    }
    
    [HttpGet("filesInfo/{courseId}")]
    public async Task<IActionResult> GetFilesInfo(long courseId, [FromQuery] long? homeworkId = null)
    {
        var filesInfo = await _filesService.GetFilesInfoAsync(courseId, homeworkId ?? -1);
        return Ok(filesInfo);
    }
    
    [HttpDelete]
    public async Task<IActionResult> DeleteFile([FromQuery] string key)
    {
        var userId = Request.GetUserIdFromHeader();
        var filesInfo = await _filesService.DeleteFileAsync(key, userId);
        return Ok(filesInfo);
    }
}