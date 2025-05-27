namespace HwProj.ContentService.API.Models.Messages;

public record ReDeleteFileMessage(
    long FileId,
    string SenderId) : IProcessFileMessage;