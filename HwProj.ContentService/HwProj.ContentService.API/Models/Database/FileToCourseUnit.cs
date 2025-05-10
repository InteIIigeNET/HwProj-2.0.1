using HwProj.ContentService.API.Models.Enums;

namespace HwProj.ContentService.API.Models.Database;

public record FileToCourseUnit
{
    public required long FileId { get; init; }
    public FileRecord FileRecord { get; set; }
    
    public required long CourseUnitId { get; init; }
    public required CourseUnitType CourseUnitType { get; init; }
    public required long CourseId { get; init; }
}