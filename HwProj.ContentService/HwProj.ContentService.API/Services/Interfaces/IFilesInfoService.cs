using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Database;
using HwProj.ContentService.API.Models.Enums;
using HwProj.Models.ContentService.DTO;

namespace HwProj.ContentService.API.Services.Interfaces;

public interface IFilesInfoService
{
    public Task<List<FileInfoDTO>> GetFilesStatusesAsync(Scope filesScope);
    public Task<string?> GetFileExternalKeyAsync(long fileId);
    public Task<Scope?> GetFileScopeAsync(long fileId);
    public Task<List<FileInfoDTO>> GetFilesInfoAsync(long courseId);
    public Task<List<FileInfoDTO>> GetFilesInfoAsync(long courseId, FileStatus filesStatus);
    public Task TransferFilesFromCourse(CourseFilesTransferDto filesTransfer);
}
