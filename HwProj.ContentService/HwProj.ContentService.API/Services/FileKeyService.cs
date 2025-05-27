using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Services.Interfaces;

namespace HwProj.ContentService.API.Services;

public class FileKeyService : IFileKeyService
{
    public string BuildFileKey(Scope scope, string fileName, long fileRecordId)
    {
        var escapedName = Uri.EscapeDataString(fileName);
        return $"courses/{scope.CourseId}/{scope.CourseUnitType}s/{scope.CourseUnitId}/{fileRecordId}_{escapedName}";
    }
}