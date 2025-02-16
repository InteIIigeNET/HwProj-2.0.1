using HwProj.Models.ContentService.DTO;

namespace HwProj.ContentService.API.Services;

public interface IFileKeyService
{
    public string BuildFileKey(UploadFileDTO dto);

    public bool GetHomeworkIdFromKey(string fileKey, out long homeworkId);
    
    public bool GetCourseIdFromKey(string fileKey, out long courseId);

    public string GetFileName(string fileKey);
    
    public string GetFilesSearchPrefix(long courseId, long homeworkId = -1);
}