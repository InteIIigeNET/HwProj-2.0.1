using HwProj.ContentService.API.Services;
using HwProj.Utils.Authorization;
using Microsoft.AspNetCore.Mvc;
using UploadFileDTO = HwProj.Models.ContentService.DTO.UploadFileDTO;

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
    
    [HttpGet("homeworkFilesInfo/{courseId}/{homeworkId}")]
    public async Task<IActionResult> GetHomeworkFilesInfo(long courseId, long homeworkId)
    {
        var filesInfo = await _filesService.GetHomeworkFilesAsync(courseId, homeworkId);
        return Ok(filesInfo);
    }
    
    [HttpGet("courseFilesInfo/{courseId}")]
    public async Task<IActionResult> GetCourseFilesInfo(long courseId)
    {
        var filesInfo = await _filesService.GetCourseFilesAsync(courseId);
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