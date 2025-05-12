namespace HwProj.ContentService.API.Models.Messages;

public record ReUploadFileMessage(
    long FileId,
    string SenderId) : IProcessFileMessage;