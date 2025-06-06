namespace HwProj.ContentService.API.Models.DTO;

public record UploadFileToS3Dto(
    Stream FileStream,
    string ContentType,
    string ExternalKey,
    string UploaderId
);