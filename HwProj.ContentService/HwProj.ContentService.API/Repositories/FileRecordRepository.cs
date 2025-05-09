using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Database;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HwProj.ContentService.API.Repositories;

public class FileRecordRepository : CrudRepository<FileRecord, long>, IFileRecordRepository
{
    public FileRecordRepository(ContentContext context)
        : base(context)
    {
    }

    public async Task<long> AddWithCourseUnitInfoAsync(FileRecord fileRecord, Scope scope)
    {
        await using var transaction = await Context.Database.BeginTransactionAsync();

        await Context.Set<FileRecord>().AddAsync(fileRecord);
        await Context.SaveChangesAsync();

        var fileRecordId = fileRecord.Id;
        var fileToCourseUnit = new FileToCourseUnit
        {
            FileId = fileRecordId,
            CourseUnitId = scope.CourseUnitId,
            CourseUnitType = scope.CourseUnitType,
            CourseId = scope.CourseId
        };
        await Context.Set<FileToCourseUnit>().AddAsync(fileToCourseUnit);
        await Context.SaveChangesAsync();

        await transaction.CommitAsync();
        return fileRecordId;
    }

    /// <summary>
    /// Уменьшает количество ссылок на файл на 1 и удаляет соответствующую запись из таблицы FileToCourseUnit.
    /// Если количество ссылок 0, ничего не происходит.
    /// </summary>
    /// <returns>количество ссылок на файл после выполнения метода.</returns>
    public async Task<int> ReduceReferenceCountAsync(FileRecord fileRecord, Scope scope)
    {
        await using var transaction = await Context.Database.BeginTransactionAsync();

        var fileToCourseUnit = await Context.Set<FileToCourseUnit>()
            .Where(fc => fc.FileId == fileRecord.Id
                         && fc.CourseUnitType == scope.CourseUnitType
                         && fc.CourseUnitId == scope.CourseUnitId)
            .FirstOrDefaultAsync();

        if (fileToCourseUnit is not null)
        {
            Context.Set<FileToCourseUnit>().Remove(fileToCourseUnit);
            await Context.SaveChangesAsync();
        }

        if (fileRecord.ReferenceCount > 0)
        {
            fileRecord.ReferenceCount--;
            await base.UpdateAsync(fileRecord.Id, _ => fileRecord);
            await Context.SaveChangesAsync();
        }

        await transaction.CommitAsync();
        return fileRecord.ReferenceCount;
    }

    public async Task<List<FileRecord>> GetByScopeAsync(Scope scope)
        => await Context.Set<FileToCourseUnit>()
            .Where(fc => fc.CourseUnitType == scope.CourseUnitType
                         && fc.CourseUnitId == scope.CourseUnitId)
            .Select(fc => fc.FileRecord)
            .ToListAsync();

    public async Task<List<FileToCourseUnit>> GetByCourseIdAsync(long courseId)
        => await Context.Set<FileToCourseUnit>()
            .Where(fc => fc.CourseId == courseId)
            .Include(fc => fc.FileRecord)
            .ToListAsync();
}