using HwProj.ContentService.API.Extensions;
using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Database;
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
    
    public async Task<List<Scope>?> GetFileScopesAsync(long fileId)
    {
        var fileToCourseUnit = await _fileRecordRepository.GetScopesAsync(fileId);
        return fileToCourseUnit;
    }

    public async Task<List<FileInfoDTO>> GetFilesInfoAsync(long courseId, FileStatus? filesStatus,
        CourseUnitType courseUnitType)
    {
        var filesRecords = await _fileRecordRepository.GetAsync(courseId, filesStatus, courseUnitType);
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

    public async Task TransferFilesFromCourse(CourseFilesTransferDto filesTransfer)
    {
        var map = filesTransfer.HomeworksMapping.ToDictionary(
            x => new Scope(filesTransfer.SourceCourseId, CourseUnitType.Homework, x.Source),
            x => new Scope(filesTransfer.TargetCourseId, CourseUnitType.Homework, x.Target)
        );

        var sourceCourseUnits = await _fileRecordRepository.GetAsync(filesTransfer.SourceCourseId);
        var unitsToAdd = sourceCourseUnits
            .Select(unit => (unit.FileRecord, Scope: unit.ToScope()))
            .Where(pair => map.ContainsKey(pair.Scope))
            .Select(pair =>
            {
                var targetScope = map[pair.Scope];
                return new FileToCourseUnit
                {
                    FileRecordId = pair.FileRecord.Id,
                    CourseId = targetScope.CourseId,
                    CourseUnitId = targetScope.CourseUnitId,
                    CourseUnitType = targetScope.CourseUnitType
                };
            })
            .ToList();

        await _fileRecordRepository.AddFileUnitsAsync(unitsToAdd);
    }
}
