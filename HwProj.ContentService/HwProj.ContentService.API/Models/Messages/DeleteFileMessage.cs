namespace HwProj.ContentService.API.Models.Messages;

public record DeleteFileMessage(
    long FileId,
    Scope FileScope,
    string SenderId) : IProcessFileMessage;