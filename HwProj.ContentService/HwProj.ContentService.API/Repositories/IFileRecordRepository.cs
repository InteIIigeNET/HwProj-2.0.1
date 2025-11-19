using System.Linq.Expressions;
using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Database;
using HwProj.ContentService.API.Models.Enums;
using Microsoft.EntityFrameworkCore.Query;

namespace HwProj.ContentService.API.Repositories;

public interface IFileRecordRepository
{
    public Task<long> AddWithCourseUnitInfoAsync(FileRecord fileRecord, Scope scope);
    public Task UpdateStatusAsync(List<long> fileRecordIds, FileStatus newStatus);
    public Task UpdateAsync(long id,
        Expression<Func<SetPropertyCalls<FileRecord>, SetPropertyCalls<FileRecord>>> setPropertyCalls);
    public Task<FileRecord?> GetFileRecordByIdAsync(long fileRecordId);
    public Task<Scope?> GetScopeByRecordIdAsync(long fileRecordId);
    public Task<List<FileRecord>> GetByScopeAsync(Scope scope);
    public Task<List<FileToCourseUnit>> GetByCourseIdAsync(long courseId);
    public Task<List<FileToCourseUnit>> GetByCourseIdAndStatusAsync(long courseId, FileStatus filesStatus);
    public Task<List<long>> GetIdsByStatusAsync(FileStatus status);
    public Task DeleteWithCourseUnitInfoAsync(long fileRecordId);
    public Task DeleteWithCourseUnitInfoAsync(List<long> fileRecordIds);
    public Task AddFileUnitsAsync(List<FileToCourseUnit> unitsToAdd);
    public Task<int> ReduceReferenceCountAsync(FileRecord fileRecord, Scope scope);
}