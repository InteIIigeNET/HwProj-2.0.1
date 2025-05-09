using System.Collections.Generic;
using System.Threading.Tasks;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Result;

namespace HwProj.ContentService.Client
{
    public interface IContentServiceClient
    {
        Task<Result> ProcessFilesAsync(ProcessFilesDTO processFilesDto);
        Task<List<FileStatusDTO>> GetFilesStatuses(ScopeDTO scopeDto);
        Task<Result<string>> GetDownloadLinkAsync(long fileId);
        Task<FileInfoDTO[]> GetFilesInfo(long courseId);
    }
}