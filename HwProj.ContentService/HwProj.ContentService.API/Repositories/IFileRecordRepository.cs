using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Database;
using HwProj.Repositories;

namespace HwProj.ContentService.API.Repositories;

public interface IFileRecordRepository : ICrudRepository<FileRecord, long>
{
    public Task<long> AddWithCourseUnitInfoAsync(FileRecord fileRecord, Scope scope);
    public Task<int> ReduceReferenceCountAsync(FileRecord fileRecord, Scope scope);
    public Task<List<FileRecord>> GetByScopeAsync(Scope scope);
    public Task<List<FileToCourseUnit>> GetByCourseIdAsync(long courseId);
}