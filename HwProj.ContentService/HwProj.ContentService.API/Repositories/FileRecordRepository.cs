using System.Linq.Expressions;
using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Database;
using HwProj.ContentService.API.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using HwProj.ContentService.API.Extensions;

namespace HwProj.ContentService.API.Repositories;

public class FileRecordRepository : IFileRecordRepository
{
    private readonly ContentContext _contentContext;

    public FileRecordRepository(ContentContext contentContext)
    {
        _contentContext = contentContext;
    }

    public async Task<long> AddWithCourseUnitInfoAsync(FileRecord fileRecord, Scope scope)
    {
        await using var transaction = await _contentContext.Database.BeginTransactionAsync();

        await _contentContext.FileRecords.AddAsync(fileRecord);
        await _contentContext.SaveChangesAsync();

        var fileRecordId = fileRecord.Id;
        var fileToCourseUnit = new FileToCourseUnit
        {
            FileRecordId = fileRecordId,
            CourseUnitId = scope.CourseUnitId,
            CourseUnitType = scope.CourseUnitType,
            CourseId = scope.CourseId
        };
        await _contentContext.FileToCourseUnits.AddAsync(fileToCourseUnit);
        await _contentContext.SaveChangesAsync();

        await transaction.CommitAsync();
        return fileRecordId;
    }

    public async Task UpdateStatusAsync(List<long> fileRecordIds, FileStatus newStatus)
        => await _contentContext.FileRecords
            .AsNoTracking()
            .Where(fr => fileRecordIds.Contains(fr.Id))
            .ExecuteUpdateAsync(setters =>
                setters.SetProperty(fr => fr!.Status, newStatus)
            );

    public async Task<FileRecord?> GetFileRecordByIdAsync(long fileRecordId)
        => await _contentContext.FileRecords
            .AsNoTracking()
            .SingleOrDefaultAsync(fr => fr.Id == fileRecordId);
    
    public async Task<Scope?> GetScopeByRecordIdAsync(long fileRecordId)
        => await _contentContext.FileToCourseUnits
            .AsNoTracking()
            .Where(fr => fr.FileRecordId == fileRecordId)
            .Select(fc => fc.ToScope())
            .SingleOrDefaultAsync();

    public async Task<List<FileRecord>> GetByScopeAsync(Scope scope)
        => await _contentContext.FileToCourseUnits
            .AsNoTracking()
            .Where(fc => fc.CourseUnitType == scope.CourseUnitType
                         && fc.CourseUnitId == scope.CourseUnitId)
            .Select(fc => fc.FileRecord)
            .ToListAsync();

    public async Task<List<FileToCourseUnit>> GetByCourseIdAsync(long courseId)
        => await _contentContext.FileToCourseUnits
            .AsNoTracking()
            .Where(fc => fc.CourseId == courseId)
            .Include(fc => fc.FileRecord)
            .ToListAsync();

    public async Task<List<FileToCourseUnit>> GetByCourseIdAndStatusAsync(long courseId, FileStatus filesStatus)
        => await _contentContext.FileToCourseUnits
            .AsNoTracking()
            .Where(fc => fc.CourseId == courseId)
            .Include(fc => fc.FileRecord)
            .Where(fc => fc.FileRecord.Status == filesStatus)
            .ToListAsync();

    public async Task<List<long>> GetIdsByStatusAsync(FileStatus status)
        => await _contentContext.FileRecords
            .AsNoTracking()
            .Where(fr => fr.Status == status)
            .Select(fr => fr.Id)
            .ToListAsync();

    public async Task DeleteWithCourseUnitInfoAsync(long fileRecordId)
    {
        await using var transaction = await _contentContext.Database.BeginTransactionAsync();
        await _contentContext.FileToCourseUnits
            .AsNoTracking()
            .Where(ftc => ftc.FileRecordId == fileRecordId)
            .ExecuteDeleteAsync();
        await _contentContext.FileRecords
            .AsNoTracking()
            .Where(f => f.Id == fileRecordId)
            .ExecuteDeleteAsync();
        await transaction.CommitAsync();
    }

    public async Task DeleteWithCourseUnitInfoAsync(List<long> fileRecordIds)
    {
        await using var transaction = await _contentContext.Database.BeginTransactionAsync();
        await _contentContext.FileToCourseUnits
            .AsNoTracking()
            .Where(ftc => fileRecordIds.Contains(ftc.FileRecordId))
            .ExecuteDeleteAsync();
        await _contentContext.FileRecords
            .AsNoTracking()
            .Where(f => fileRecordIds.Contains(f.Id))
            .ExecuteDeleteAsync();
        await transaction.CommitAsync();
    }

    /// <summary>
    /// Уменьшает количество ссылок на файл на 1 и удаляет соответствующую запись из таблицы FileToCourseUnit.
    /// Если количество ссылок 0, ничего не происходит.
    /// </summary>
    /// <returns>количество ссылок на файл после выполнения метода.</returns>
    public async Task<int> ReduceReferenceCountAsync(FileRecord fileRecord, Scope scope)
    {
        await using var transaction = await _contentContext.Database.BeginTransactionAsync();

        await _contentContext.FileToCourseUnits
            .AsNoTracking()
            .Where(fc => fc.FileRecordId == fileRecord.Id
                         && fc.CourseUnitType == scope.CourseUnitType
                         && fc.CourseUnitId == scope.CourseUnitId)
            .ExecuteDeleteAsync();

        if (fileRecord.ReferenceCount > 0)
        {
            fileRecord.ReferenceCount--;
            await _contentContext.FileRecords
                .AsNoTracking()
                .Where(fr => fr.Id == fileRecord.Id)
                .ExecuteUpdateAsync(setters =>
                    setters.SetProperty(fr => fr!.ReferenceCount, fileRecord.ReferenceCount)
                );
        }

        await transaction.CommitAsync();
        return fileRecord.ReferenceCount;
    }

    /// Переносит файлы с помощью добавления записей в FileToCourseUnit согласно переданному отображению.
    /// Увеличивает число ссылок на файлы на число добавленных записей, соответствующих файлу.
    public async Task AddFileUnitsAsync(List<FileToCourseUnit> unitsToAdd)
    {
        await using var transaction = await _contentContext.Database.BeginTransactionAsync();

        await _contentContext.FileToCourseUnits.AddRangeAsync(unitsToAdd);
        foreach (var unit in unitsToAdd)
        {
            await UpdateAsync(
                unit.FileRecordId,
                setters => setters.SetProperty(x => x.ReferenceCount, x => x.ReferenceCount + 1));
        }

        await _contentContext.SaveChangesAsync();
        await transaction.CommitAsync();
    }

    public async Task UpdateAsync(long id,
        Expression<Func<SetPropertyCalls<FileRecord>, SetPropertyCalls<FileRecord>>> setPropertyCalls)
        => await _contentContext.FileRecords
            .AsNoTracking()
            .Where(fr => fr.Id == id)
            .ExecuteUpdateAsync(setPropertyCalls);
}
