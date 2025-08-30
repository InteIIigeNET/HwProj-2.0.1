using System.Threading.Tasks;
using System.Collections.Generic;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Result;

namespace HwProj.ContentService.Client
{
    public interface IContentServiceClient
    {
        Task<Result> ProcessFilesAsync(ProcessFilesDTO processFilesDto);
        Task<Result<FileInfoDTO[]>> GetFilesStatuses(ScopeDTO scopeDto);
        Task<Result<string>> GetDownloadLinkAsync(long fileId);
        Task<Result<FileInfoDTO[]>> GetFilesInfo(long courseId);
        Task<Result<FileInfoDTO[]>> GetUploadedFilesInfo(long courseId);
        Task<Result> TransferFiles(Dictionary<ScopeDTO, ScopeDTO> scopeMapping);
    }
}