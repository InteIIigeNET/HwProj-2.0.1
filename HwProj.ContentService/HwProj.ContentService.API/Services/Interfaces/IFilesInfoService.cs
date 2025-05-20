using HwProj.ContentService.API.Models;
using HwProj.Models.ContentService.DTO;

namespace HwProj.ContentService.API.Services.Interfaces;

public interface IFilesInfoService
{
    public Task<List<FileStatusDTO>> GetFilesStatusesAsync(Scope filesScope);
    public Task<string?> GetFileExternalKeyAsync(long fileId);
    public Task<List<FileInfoDTO>> GetFilesInfoAsync(long courseId);
}