using System.Transactions;
using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Enums;
using HwProj.ContentService.API.Repositories;
using HwProj.ContentService.API.Services.Interfaces;
using HwProj.Models.ContentService.DTO;

namespace HwProj.ContentService.API.Services;

public class FilesInfoService : IFilesInfoService
{
    private readonly IFileRecordRepository _fileRecordRepository;

    public FilesInfoService(IFileRecordRepository fileRecordRepository)
    {
        _fileRecordRepository = fileRecordRepository;
    }

    public async Task<List<FileInfoDTO>> GetFilesStatusesAsync(Scope filesScope)
    {
        var filesRecords = await _fileRecordRepository.GetByScopeAsync(filesScope);
        return filesRecords.Select(fr => new FileInfoDTO
        {
            Id = fr.Id,
            Name = fr.OriginalName,
            SizeInBytes = fr.SizeInBytes,
            Status = fr.Status.ToString(),
            CourseUnitType = filesScope.CourseUnitType.ToString(),
            CourseUnitId = filesScope.CourseUnitId
        }).ToList();
    }

    public async Task<string?> GetFileExternalKeyAsync(long fileId)
    {
        var fileRecord = await _fileRecordRepository.GetFileRecordByIdAsync(fileId);
        return fileRecord?.ExternalKey;
    }

    public async Task<List<FileInfoDTO>> GetFilesInfoAsync(long courseId)
    {
        var filesToCourseUnits = await _fileRecordRepository.GetByCourseIdAsync(courseId);
        return filesToCourseUnits.Select(fcu => new FileInfoDTO
        {
            Id = fcu.FileRecord.Id,
            Name = fcu.FileRecord.OriginalName,
            Status = fcu.FileRecord.Status.ToString(),
            SizeInBytes = fcu.FileRecord.SizeInBytes,
            CourseUnitType = fcu.CourseUnitType.ToString(),
            CourseUnitId = fcu.CourseUnitId
        }).ToList();
    }

    public async Task<List<FileInfoDTO>> GetFilesInfoAsync(long courseId, FileStatus filesStatus)
    {
        var filesRecords = await _fileRecordRepository.GetByCourseIdAndStatusAsync(courseId, filesStatus);
        return filesRecords.Select(fcu => new FileInfoDTO
        {
            Id = fcu.FileRecord.Id,
            Name = fcu.FileRecord.OriginalName,
            SizeInBytes = fcu.FileRecord.SizeInBytes,
            Status = fcu.FileRecord.Status.ToString(),
            CourseUnitType = fcu.CourseUnitType.ToString(),
            CourseUnitId = fcu.CourseUnitId
        }).ToList();
    }

    public async Task TransferFiles(Dictionary<Scope, Scope> scopeMapping)
    {
        using var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

        foreach (var (source, target) in scopeMapping)
        {
            var fileRecords = await _fileRecordRepository.GetByScopeAsync(source);
            await _fileRecordRepository.AddReferencesAsync(fileRecords, target);
        }

        transactionScope.Complete();
    }
}