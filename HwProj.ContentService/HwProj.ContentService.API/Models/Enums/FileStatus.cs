namespace HwProj.ContentService.API.Models;

public enum FileStatus
{
    Uploading,
    UploadingError,
    ReadyToUse,
    Deleting,
    DeletingError
}