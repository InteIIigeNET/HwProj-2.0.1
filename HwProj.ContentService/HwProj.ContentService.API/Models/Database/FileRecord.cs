using HwProj.ContentService.API.Models.Enums;
using HwProj.Repositories;

namespace HwProj.ContentService.API.Models.Database;

public record FileRecord : IEntity<long>
{
    public long Id { get; set; }
    public FileStatus Status { get; set; } = FileStatus.Uploading;
    public required string OriginalName { get; init; }
    public string? LocalPath { get; set; }
    public string? ExternalKey { get; set; }
    public required long SizeInBytes { get; init; }
    public int ReferenceCount { get; set; } = 1;
}