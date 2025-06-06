using HwProj.ContentService.API.Models.DTO;
using HwProj.Models.Result;

namespace HwProj.ContentService.API.Services.Interfaces;

public interface IS3FilesService
{
    public Task<Result> UploadFileAsync(UploadFileToS3Dto uploadFileToS3Dto);
    public Task<List<FileTransferDTO>> GetBucketFilesAsync(string bucketName, string filePathPattern);
    public Task<Result<string>> GetDownloadUrl(string fileKey);
    public Task<bool> CheckFileExistence(string fileKey);
    public Task<Result> DeleteFileAsync(string fileKey);
}