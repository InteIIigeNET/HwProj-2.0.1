using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Enums;
using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Repositories;
using HwProj.ContentService.API.Services.Interfaces;

namespace HwProj.ContentService.API.Services;

public class RecoveryService : IRecoveryService
{
    private const string SenderId = "ContentMicroservice";

    private readonly IFileRecordRepository _fileRecordRepository;
    private readonly IS3FilesService _s3FilesService;
    private readonly IMessageProducer _messageProducer;
    private readonly IFileKeyService _fileKeyService;
    private readonly ILocalFilesService _localFilesService;
    private readonly ILogger<RecoveryService> _logger;

    public RecoveryService(IFileRecordRepository fileRecordRepository, ILogger<RecoveryService> logger,
        IMessageProducer messageProducer, IS3FilesService s3FilesService, IFileKeyService fileKeyService,
        ILocalFilesService localFilesService)
    {
        _fileRecordRepository = fileRecordRepository;
        _logger = logger;
        _messageProducer = messageProducer;
        _s3FilesService = s3FilesService;
        _fileKeyService = fileKeyService;
        _localFilesService = localFilesService;
    }

    public async Task TransferFiles(string oldBucketName, string oldFilesPathRegex)
    {
        _logger.LogInformation("Начинаем процесс переноса файлов из бакета {oldBucketName}", oldBucketName);

        var filesTransferInfo = await _s3FilesService.GetBucketFilesAsync(oldBucketName, oldFilesPathRegex);
        foreach (var fileTransferDto in filesTransferInfo)
        {
            var fileScope = new Scope(
                fileTransferDto.CourseId,
                fileTransferDto.CourseUnitType,
                fileTransferDto.CourseUnitId
            );
            var localFilePath = _fileKeyService.BuildServerFilePath(fileScope, fileTransferDto.Name);
            
            // Сохраняем файл локально
            await _localFilesService.SaveFile(fileTransferDto.FileStream, localFilePath);
            
            _logger.LogInformation("Файл {FileName} успешно сохранён в локальное хранилище по пути {localFilePath}",
                fileTransferDto.Name, localFilePath);

            var message = new UploadFileMessage(
                Scope: fileScope,
                LocalFilePath: localFilePath,
                ContentType: fileTransferDto.ContentType,
                OriginalName: fileTransferDto.Name,
                SizeInBytes: fileTransferDto.SizeInBytes,
                SenderId: SenderId
            );
            
            await _messageProducer.PushUploadFilesMessages([ message ]);
        }

        _logger.LogInformation(
            "Перенос файлов из бакета {oldBucketName} окончен: сообщения на загрузку файлов в новый бакет добавлены в канал",
            oldBucketName);
    }

    public async Task ReProcessPendingFiles()
    {
        await ReProcessDeletingFilesAsync();
        await ReProcessUploadingFilesAsync();
    }

    private async Task ReProcessUploadingFilesAsync()
    {
        _logger.LogInformation("Начинаем поиск записей файлов в статусе {Uploading}", FileStatus.Uploading);
        var loadingFilesIds = await _fileRecordRepository.GetIdsByStatusAsync(FileStatus.Uploading);
        if (loadingFilesIds.Count == 0)
        {
            _logger.LogInformation("Найдено 0 записей файлов в статусе {Uploading}", FileStatus.Uploading);
            return;
        }

        _logger.LogInformation(
            "Найдено {recordsCount} записей файлов в статусе {Uploading}. Отправляем сообщения для проверки наличия файлов и повторной загрузки",
            FileStatus.Uploading, loadingFilesIds.Count);
        await _messageProducer.PushReUploadFilesMessages(loadingFilesIds, SenderId);
    }

    private async Task ReProcessDeletingFilesAsync()
    {
        _logger.LogInformation("Начинаем поиск записей файлов в статусе {Deleting}", FileStatus.Deleting);
        var deletingFilesIds = await _fileRecordRepository.GetIdsByStatusAsync(FileStatus.Deleting);
        if (deletingFilesIds.Count == 0)
        {
            _logger.LogInformation("Найдено 0 записей файлов в статусе {Deleting}", FileStatus.Deleting);
            return;
        }

        _logger.LogInformation(
            "Найдено {recordsCount} записей в статусе {Deleting}. Приступаем к проверке наличия файлов во внешнем хранилище и обновлению статусов",
            FileStatus.Deleting, deletingFilesIds.Count);
        await _messageProducer.PushReDeleteFilesMessages(deletingFilesIds, SenderId);
    }
}