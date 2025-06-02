using HwProj.ContentService.API.Models;

namespace HwProj.ContentService.API.Services.Interfaces;

public interface IFileKeyService
{
    public string BuildS3FileKey(Scope scope, string fileName, long fileRecordId);
    public string BuildServerFilePath(Scope scope, string fileName);
}