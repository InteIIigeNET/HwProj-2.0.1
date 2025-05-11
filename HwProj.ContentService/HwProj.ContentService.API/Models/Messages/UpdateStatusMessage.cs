using HwProj.ContentService.API.Models.Enums;

namespace HwProj.ContentService.API.Models.Messages;

public record UpdateStatusMessage(
    long FileId,
    FileStatus NewStatus,
    string SenderId) : IProcessFileMessage;