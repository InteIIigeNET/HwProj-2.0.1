using HwProj.ContentService.API.Models.Enums;
using HwProj.Repositories;

namespace HwProj.ContentService.API.Models.Database;

public record FileRecord
{
    public long Id { get; set; }
    public required FileStatus Status { get; set; }
    public required string OriginalName { get; init; }
    public string? LocalPath { get; set; }
    public string? ExternalKey { get; set; }
    public required long SizeInBytes { get; init; }
    public required string ContentType { get; init; }
    public required int ReferenceCount { get; set; }
}