using System.Text.RegularExpressions;
using HwProj.Models.ContentService.DTO;

namespace HwProj.ContentService.API.Services;

public class FileKeyService : IFileKeyService
{
    public string BuildFileKey(UploadFileDTO dto)
        => $"courses/{dto.CourseId}/lecturers/homeworks/{dto.HomeworkId}/files/{dto.File.FileName}";
    
    public bool GetHomeworkIdFromKey(string fileKey, out long homeworkId)
    {
        var match = Regex.Match(
            fileKey,
            @"/homeworks/(?<homeworkId>\d+)(?=/|$)",
            RegexOptions.IgnoreCase
        );

        return long.TryParse(match.Groups["homeworkId"].Value, out homeworkId);
    }
    
    public bool GetCourseIdFromKey(string fileKey, out long courseId)
    {
        var match = Regex.Match(
            fileKey,
            @"courses/(?<courseId>\d+)(?=/|$)",
            RegexOptions.IgnoreCase
        );

        return long.TryParse(match.Groups["courseId"].Value, out courseId);
    }
    
    public string GetFileName(string fileKey)
        => fileKey.Split('/').Last();

    public string GetFilesSearchPrefix(long courseId, long homeworkId = -1) 
        => homeworkId == -1
            ? $"courses/{courseId}/lecturers/"
            : $"courses/{courseId}/lecturers/homeworks/{homeworkId}/files/";
}