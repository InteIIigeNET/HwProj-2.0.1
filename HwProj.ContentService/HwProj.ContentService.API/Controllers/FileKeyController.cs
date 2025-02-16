using HwProj.ContentService.API.Services;
using HwProj.Models.Result;
using Microsoft.AspNetCore.Mvc;

namespace HwProj.ContentService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileKeyController : ControllerBase
{
    private readonly IFileKeyService _fileKeyService;

    public FileKeyController(IFileKeyService fileKeyService)
    {
        _fileKeyService = fileKeyService;
    }
    
    [HttpGet("courseId")]
    public IActionResult GetCourseId([FromQuery] string key)
    {
        if (!_fileKeyService.GetCourseIdFromKey(key, out var courseId))
            return Ok(Result<long>.Failed("Ключ файла не содержит идентификатор курса"));

        return Ok(Result<long>.Success(courseId));
    }
}
