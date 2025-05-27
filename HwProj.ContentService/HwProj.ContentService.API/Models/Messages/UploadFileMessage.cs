namespace HwProj.ContentService.API.Models.Messages;

public record UploadFileMessage(
    Scope Scope,
    string LocalFilePath,
    string ContentType,
    string OriginalName,
    long SizeInBytes,
    string SenderId) : IProcessFileMessage;