using HwProj.ContentService.API.Models.Database;
using HwProj.ContentService.API.Models.Enums;
using HwProj.ContentService.API.Repositories;
using HwProj.ContentService.API.Services.Interfaces;

namespace HwProj.ContentService.API.Services;

public class RecoveryService : IRecoveryService
{
    private readonly IFileRecordRepository _fileRecordRepository;
    private readonly IS3FilesService _s3FilesService;

    private readonly ILogger<RecoveryService> _logger;

    public RecoveryService(IFileRecordRepository fileRecordRepository, IS3FilesService s3FilesService,
        ILogger<RecoveryService> logger)
    {
        _fileRecordRepository = fileRecordRepository;
        _s3FilesService = s3FilesService;
        _logger = logger;
    }

    public async Task UpdateFilesStatusesAsync()
    {
        await UpdateUploadingFilesAsync();
        await UpdateDeletingFilesAsync();
    }

    private async Task UpdateUploadingFilesAsync()
    {
        _logger.LogInformation("Начинаем поиск записей файлов в статусе {Uploading}", FileStatus.Uploading);
        var loadingFiles = await _fileRecordRepository.GetByStatusAsync(FileStatus.Uploading);
        if (loadingFiles.Count == 0)
        {
            _logger.LogInformation("Найдено 0 записей файлов в статусе {Uploading}", FileStatus.Uploading);
            return;
        }
            
        _logger.LogInformation(
            "Найдено {recordsCount} записей. Приступаем к проверке наличия файлов во внешнем хранилище и обновлению статусов",
            loadingFiles.Count);
        var s3Results = await GetS3FilesExistenceInfo(loadingFiles);

        var uploadedFileIds =
            s3Results.Where(s3Result => s3Result.DoesExist).Select(s3Result => s3Result.FileId).ToList();
        await _fileRecordRepository.UpdateStatusAsync(uploadedFileIds, FileStatus.ReadyToUse);

        var lostFileIds =
            s3Results.Where(s3Result => !s3Result.DoesExist).Select(s3Result => s3Result.FileId).ToList();
        await _fileRecordRepository.UpdateStatusAsync(lostFileIds, FileStatus.UploadingError);

        _logger.LogInformation(
            "Записи файлов успешно обновлены: {uploadedFilesCount} файла в статусе {ReadyToUse}, {lostFilesCount} в статусе {UploadingError}",
            uploadedFileIds.Count, FileStatus.ReadyToUse, lostFileIds.Count, FileStatus.UploadingError);
        
        // TODO: Удаляем локальные файлы для записей в статусе ReadyToUse и загружаем на S3 для записей в статусе UploadingError
    }

    private async Task UpdateDeletingFilesAsync()
    {
        _logger.LogInformation("Начинаем поиск записей файлов в статусе {Deleting}", FileStatus.Deleting);
        var deletingFiles = await _fileRecordRepository.GetByStatusAsync(FileStatus.Deleting);
        if (deletingFiles.Count == 0)
        {
            _logger.LogInformation("Найдено 0 записей файлов в статусе {Deleting}", FileStatus.Deleting);
            return;
        }

        _logger.LogInformation(
            "Найдено {recordsCount} записей. Приступаем к проверке наличия файлов во внешнем хранилище и обновлению статусов",
            deletingFiles.Count);
        var s3Results = await GetS3FilesExistenceInfo(deletingFiles);
        
        var deletedFileIds =
            s3Results.Where(s3Result => !s3Result.DoesExist).Select(s3Result => s3Result.FileId).ToList();
        await _fileRecordRepository.DeleteWithCourseUnitInfoAsync(deletedFileIds);

        var existingFileIds =
            s3Results.Where(s3Result => s3Result.DoesExist).Select(s3Result => s3Result.FileId).ToList();
        await _fileRecordRepository.UpdateStatusAsync(existingFileIds, FileStatus.DeletingError);

        _logger.LogInformation(
            "Записи файлов успешно обновлены: {existingFilesCount} файла в статусе {DeletingError}, {deletedFilesCount} удалено",
            existingFileIds.Count, FileStatus.DeletingError, deletedFileIds.Count);
        
        // TODO: Сами удаляем файлы во внешнем хранилище для записей в статусе DeletingError
    }

    private async Task<(long FileId, bool DoesExist)[]> GetS3FilesExistenceInfo(List<FileRecord?> fileRecords)
    {
        var s3Tasks = fileRecords.Select(async fileRecord =>
            (fileRecord.Id, await _s3FilesService.CheckFileExistence(fileRecord.ExternalKey)));
        return await Task.WhenAll(s3Tasks);
    }
}