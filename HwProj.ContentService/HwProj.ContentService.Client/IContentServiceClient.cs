using System.Threading.Tasks;
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
        public Task<Result> TransferFilesFromCourse(CourseFilesTransferDTO filesTransferDTO);
    }
}
