using System.Threading.Channels;
using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Database;
using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Repositories;
using HwProj.ContentService.API.Services.Interfaces;

namespace HwProj.ContentService.API.Services;

public class MessageConsumer : BackgroundService
{
    private readonly ChannelReader<IProcessFileMessage> _channelReader;
    private readonly ILogger<MessageConsumer> _logger;
    private readonly HashSet<long> _filesActiveContinuations = new();

    private readonly IMessageProducer _messageProducer;
    private readonly IS3FilesService _s3FilesService;
    private readonly IFileKeyService _fileKeyService;
    private readonly IFileRecordRepository _fileRecordRepository;

    public MessageConsumer(ChannelReader<IProcessFileMessage> channelReader, ILogger<MessageConsumer> logger,
        IMessageProducer messageProducer, IS3FilesService s3FilesService, IFileKeyService fileKeyService,
        IFileRecordRepository fileRecordRepository)
    {
        _channelReader = channelReader;
        _logger = logger;
        _messageProducer = messageProducer;
        _s3FilesService = s3FilesService;
        _fileKeyService = fileKeyService;
        _fileRecordRepository = fileRecordRepository;
    }

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        await foreach (var message in _channelReader.ReadAllAsync(cancellationToken))
        {
            await ProcessMessage(message);
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Приступаем к завершению работы обработчика сообщений MessageConsumer");
        // Обрабатываем оставшиеся сообщений в канале
        while (_channelReader.TryRead(out var message))
        {
            await ProcessMessage(message);
        }

        // Ждем завершения всех дополнительных задач
        while (_filesActiveContinuations.Count > 0)
        {
        }

        // Ещё раз обрабатываем оставшиеся сообщения в канале, поскольку некоторые задачи содержат отправку сообщения
        while (_channelReader.TryRead(out var message))
        {
            await ProcessMessage(message);
        }

        _logger.LogInformation("Канал сообщений пуст, обработчик MessageConsumer успешно приостановлен");
    }

    private async Task ProcessMessage(IProcessFileMessage message)
    {
        switch (message)
        {
            case UploadFileMessage uploadFileMessage:
                await HandleUploadFileMessage(uploadFileMessage);
                break;
            case UpdateStatusMessage updateStatusMessage:
                await HandleUpdateStatusMessage(updateStatusMessage);
                break;
            case DeleteFileMessage deleteFileMessage:
                await HandleDeleteFileMessage(deleteFileMessage);
                break;
            case FileDeletedMessage fileDeletedMessage:
                await HandleFileDeletedMessage(fileDeletedMessage);
                break;
            default:
                _logger.LogWarning("Необработанное сообщение типа {messageType} от пользователя {senderId}",
                    message.GetType().Name, message.SenderId);
                break;
        }
    }

    private async Task HandleUploadFileMessage(UploadFileMessage message)
    {
        var fileName = message.FileContent.Name;
        var s3Key = _fileKeyService.BuildFileKey(message.Scope, fileName);
        var fileRecord = new FileRecord
        {
            OriginalName = fileName,
            SizeInBytes = message.FileContent.Length,
            ExternalKey = s3Key,
        };

        var fileId = await _fileRecordRepository.AddWithCourseUnitInfoAsync(fileRecord, message.Scope);
        _logger.LogInformation("Информация о файле {fileId} от пользователя {senderId} успешно добавлена в базу данных",
            fileId, message.SenderId);

        UploadFileToS3AndUpdateStatus(message, s3Key, fileId);
    }

    private async Task HandleUpdateStatusMessage(UpdateStatusMessage message)
    {
        await _fileRecordRepository.UpdateAsync(message.FileId, fr => new FileRecord
        {
            OriginalName = fr.OriginalName,
            SizeInBytes = fr.SizeInBytes,
            ExternalKey = fr.ExternalKey,
            
            Status = message.NewStatus
        });
        _logger.LogInformation(
            "Статус файла {fileId} успешно обновлён на {newStatus} по запросу пользователя {senderId}",
            message.FileId, message.NewStatus, message.SenderId);
    }

    private async Task HandleDeleteFileMessage(DeleteFileMessage message)
    {
        var fileRecord = await _fileRecordRepository.GetAsync(message.FileId);
        if (fileRecord.Status is FileStatus.Uploading)
        {
            _logger.LogError("Ошибка удаления файла {fileId} пользователем {senderId}: файл ещё загружается",
                fileRecord.Id, message.SenderId);
            return;
        }

        if (fileRecord.ReferenceCount > 1)
        {
            var newReferenceCount = await _fileRecordRepository.ReduceReferenceCountAsync(fileRecord, message.FileScope);
            _logger.LogInformation("Количество ссылок на файл {fileId} уменьшено с {previousReferenceCount} " +
                                   "до {newReferenceCount} по запросу пользователя {senderId}",
                message.FileId, fileRecord.ReferenceCount, newReferenceCount, message.SenderId);
            return;
        }

        fileRecord.Status = FileStatus.Deleting;
        await _fileRecordRepository.UpdateAsync(message.FileId, _ => fileRecord);
        _logger.LogInformation(
            "Статус файла {fileId} успешно обновлён на {status} по запросу пользователя {senderId}",
            message.FileId, fileRecord.Status.ToString(), message.SenderId);

        DeleteFileFromS3AndUpdateStatus(message, fileRecord.ExternalKey);
    }

    private async Task HandleFileDeletedMessage(FileDeletedMessage message)
    {
        await _fileRecordRepository.DeleteWithCourseUnitInfoAsync(message.FileId);
        _logger.LogInformation("Информация о файле {fileId} успешно удалена из базы данных по запросу пользователя {senderId}",
            message.FileId, message.SenderId);
    }

    private async Task UploadFileToS3AndUpdateStatus(UploadFileMessage message, string s3Key, long fileId)
    {
        // Сигнализируем, что для fileId есть задача, завершения которой нужно дождаться при остановке сервиса
        _filesActiveContinuations.Add(fileId);

        var s3UploadingResult =
            await _s3FilesService.UploadFileAsync(message.FileContent, s3Key, message.SenderId);
        if (!s3UploadingResult.Succeeded)
            _logger.LogError("Не удалось загрузить файл {fileId} во внешнее хранилище. Ошибка: {error}",
                fileId, s3UploadingResult.Errors[0]);

        var updateStatusMessage = new UpdateStatusMessage(
            FileId: fileId,
            NewStatus: s3UploadingResult.Succeeded ? FileStatus.ReadyToUse : FileStatus.UploadingError,
            SenderId: message.SenderId
        );
        await _messageProducer.PushUpdateFileStatusMessage(updateStatusMessage);
        
        // Задача для fileId завершена, новое сообщение отправлено в канал
        _filesActiveContinuations.Remove(fileId);
    }
    
    private async Task DeleteFileFromS3AndUpdateStatus(DeleteFileMessage message, string s3Key)
    {
        // Сигнализируем, что для message.FileId есть задача, завершения которой нужно дождаться при остановке сервиса
        _filesActiveContinuations.Add(message.FileId);
        var s3DeletingResult = await _s3FilesService.DeleteFileAsync(s3Key);
        if (s3DeletingResult.Succeeded)
        {
            var fileDeletedMessage = new FileDeletedMessage(message.FileId, message.SenderId);
            await _messageProducer.PushFileDeletedMessage(fileDeletedMessage);
            
            // Задача для message.FileId завершена, новое сообщение отправлено в канал
            _filesActiveContinuations.Remove(message.FileId);
            return;
        }

        _logger.LogError("Не удалось удалить файл {fileId} из внешнего хранилища по запросу пользователя {senderId}. " +
                         "Ошибка: {error}", message.FileId, message.SenderId, s3DeletingResult.Errors[0]);
        var updateStatusMessage = new UpdateStatusMessage(
            FileId: message.FileId,
            NewStatus: FileStatus.DeletingError,
            SenderId: message.SenderId
        );
        await _messageProducer.PushUpdateFileStatusMessage(updateStatusMessage);
        
        // Задача для message.FileId завершена, новое сообщение отправлено в канал
        _filesActiveContinuations.Remove(message.FileId);
    }
}