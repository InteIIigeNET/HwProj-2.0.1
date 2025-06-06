namespace HwProj.ContentService.API.Models.Messages;

public record FileDeletedMessage(
    long FileId,
    string SenderId) : IProcessFileMessage;