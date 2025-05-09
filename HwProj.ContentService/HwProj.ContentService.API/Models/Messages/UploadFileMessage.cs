namespace HwProj.ContentService.API.Models.Messages;

public record UploadFileMessage(
    Scope Scope,
    IFormFile FileContent,
    string SenderId) : IProcessFileMessage;