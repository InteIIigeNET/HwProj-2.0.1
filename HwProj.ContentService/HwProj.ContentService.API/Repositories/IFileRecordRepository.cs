using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Database;
using HwProj.Repositories;

namespace HwProj.ContentService.API.Repositories;

public interface IFileRecordRepository : ICrudRepository<FileRecord, long>
{
    public Task<long> AddWithCourseUnitInfoAsync(FileRecord fileRecord, Scope scope);
    public Task UpdateStatusAsync(List<long> fileRecordIds, FileStatus newStatus);
    public Task<List<FileRecord>> GetByScopeAsync(Scope scope);
    public Task<List<FileToCourseUnit>> GetByCourseIdAsync(long courseId);
    public Task<List<FileRecord>> GetByStatusAsync(FileStatus status);
    public Task DeleteWithCourseUnitInfoAsync(long fileRecordId);
    public Task DeleteWithCourseUnitInfoAsync(List<long> fileRecordIds);
    public Task<int> ReduceReferenceCountAsync(FileRecord fileRecord, Scope scope);
}