using HwProj.Models.ContentService.DTO;
using HwProj.Models.Result;

namespace HwProj.ContentService.API.Services;

public interface IFilesService
{
    public Task<Result> UploadFileAsync(UploadFileDTO uploadFileDto, string uploaderId);

    public Task<Result<string>> GetDownloadUrl(string fileKey);

    public Task<List<CourseFileInfoDTO>> GetCourseFilesAsync(long courseId);

    public Task<List<HomeworkFileInfoDTO>> GetHomeworkFilesAsync(long courseId, long homeworkId);

    public Task<Result> DeleteFileAsync(string fileKey, string userId);
}