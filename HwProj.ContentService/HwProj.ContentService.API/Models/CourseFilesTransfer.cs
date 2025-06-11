namespace HwProj.ContentService.API.Models;

public record CourseFilesTransfer
{
    public long SourceCourseId { get; set; }
    public Dictionary<Scope, Scope> ScopeMapping { get; set; } = [];
}
