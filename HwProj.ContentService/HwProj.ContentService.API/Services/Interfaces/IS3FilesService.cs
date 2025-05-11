using HwProj.Models.Result;

namespace HwProj.ContentService.API.Services.Interfaces;

public interface IS3FilesService
{
    public Task<Result> UploadFileAsync(Stream fileStream, string contentType, string externalKey, string uploaderId);
    public Task<Result<string>> GetDownloadUrl(string fileKey);
    public Task<bool> CheckFileExistence(string fileKey);
    public Task<Result> DeleteFileAsync(string fileKey);
}