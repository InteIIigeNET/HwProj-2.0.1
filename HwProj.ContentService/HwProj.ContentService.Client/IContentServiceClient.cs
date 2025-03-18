using System.Threading.Tasks;
using HwProj.Models.ContentService.DTO;
using HwProj.Models.Result;

namespace HwProj.ContentService.Client
{
    public interface IContentServiceClient
    {
        Task<Result> UploadFileAsync(UploadFileDTO uploadFileDto);
        
        Task<Result<string>> GetDownloadLinkAsync(string fileKey);
        
        Task<Result<FileInfoDTO[]>> GetFilesInfo(long courseId, long? homeworkId = null);
        
        Task<Result> DeleteFileAsync(string fileKey);
    }
}