using HwProj.Repositories;

namespace HwProj.ContentService.API.Models.Database;

public record FileRecord : IEntity<long>
{
    public long Id { get; set; }
    public FileStatus Status { get; set; } = FileStatus.Uploading;
    public required string OriginalName { get; init; }
    public required string ExternalKey { get; init; }
    public required decimal SizeInKB { get; init; }
    public int ReferenceCount { get; set; } = 1;
}