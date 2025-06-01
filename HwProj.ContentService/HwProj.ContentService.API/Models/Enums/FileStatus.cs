namespace HwProj.ContentService.API.Models.Enums;

public enum FileStatus
{
    Uploading = 0,
    UploadingError = 1,
    ReadyToUse = 2,
    Deleting = 3,
    DeletingError = 4
}