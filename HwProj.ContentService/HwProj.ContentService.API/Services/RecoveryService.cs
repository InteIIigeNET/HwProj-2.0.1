using HwProj.ContentService.API.Models.Enums;
using HwProj.ContentService.API.Repositories;
using HwProj.ContentService.API.Services.Interfaces;

namespace HwProj.ContentService.API.Services;

public class RecoveryService : IRecoveryService
{
    private const string SenderId = "ContentMicroservice";

    private readonly IFileRecordRepository _fileRecordRepository;
    private readonly IMessageProducer _messageProducer;
    private readonly ILogger<RecoveryService> _logger;
    
    public RecoveryService(IFileRecordRepository fileRecordRepository, ILogger<RecoveryService> logger,
        IMessageProducer messageProducer)
    {
        _fileRecordRepository = fileRecordRepository;
        _logger = logger;
        _messageProducer = messageProducer;
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