namespace HwProj.ContentService.API.Models.DTO;

public record UploadFileTaskDto(
    long FileRecordId,
    string LocalFilePath,
    string ContentType,
    string ExternalKey,
    string UploaderId
);