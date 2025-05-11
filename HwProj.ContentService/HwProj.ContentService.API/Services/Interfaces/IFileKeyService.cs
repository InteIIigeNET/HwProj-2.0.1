using HwProj.ContentService.API.Models;

namespace HwProj.ContentService.API.Services.Interfaces;

public interface IFileKeyService
{
    public string BuildFileKey(Scope scope, string fileName, long fileRecordId);
}