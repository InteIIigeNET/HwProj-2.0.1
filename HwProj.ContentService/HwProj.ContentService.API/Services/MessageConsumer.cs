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
                    _logger.LogWarning("Необработанное сообщение типа {messageType}", message.GetType().Name);
                    break;
            }
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
        _logger.LogInformation($"Информация о файле {fileId} успешно добавлена в базу данных");

        Task.Run(async () =>
        {
            var s3UploadingResult =
                await _s3FilesService.UploadFileAsync(message.FileContent, s3Key, message.SenderId);
            if (!s3UploadingResult.Succeeded)
                _logger.LogError($"Не удалось загрузить файл {fileId} во внешнее хранилище. " +
                                 $"Ошибка: {s3UploadingResult.Errors[0]}");

            var updateStatusMessage = new UpdateStatusMessage(
                FileId: fileId,
                NewStatus: s3UploadingResult.Succeeded ? FileStatus.ReadyToUse : FileStatus.UploadingError,
                SenderId: message.SenderId
            );
            await _messageProducer.PushUpdateFileStatusMessage(updateStatusMessage);
        });
    }

    private async Task HandleUpdateStatusMessage(UpdateStatusMessage message)
    {
        var fileRecord = await _fileRecordRepository.GetAsync(message.FileId);
        if (fileRecord.Status is FileStatus.Uploading && message.NewStatus is FileStatus.Deleting)
            _logger.LogError($"Ошибка удаления файла {message.FileId} пользователем {message.SenderId}: " +
                             $"файл ещё загружается");

        fileRecord.Status = message.NewStatus;
        await _fileRecordRepository.UpdateAsync(message.FileId, _ => fileRecord);
        _logger.LogInformation($"Статус файла {message.FileId} успешно обновлён на {message.NewStatus} " +
                              $"по запросу пользователя {message.SenderId}");
    }

    private async Task HandleDeleteFileMessage(DeleteFileMessage message)
    {
        var fileRecord = await _fileRecordRepository.GetAsync(message.FileId);
        if (fileRecord.Status is FileStatus.Uploading)
        {
            _logger.LogError($"Ошибка удаления файла {fileRecord.Id} пользователем {message.SenderId}: " +
                             $"файл ещё загружается");
            return;
        }

        if (fileRecord.ReferenceCount > 1)
        {
            var newReferenceCount =
                await _fileRecordRepository.ReduceReferenceCountAsync(fileRecord, message.FileScope);
            _logger.LogInformation(
                $"Количество ссылок на файл {message.FileId} уменьшено с {fileRecord.ReferenceCount} " +
                $"до {newReferenceCount} по запросу пользователя {message.SenderId}");
            return;
        }

        fileRecord.Status = FileStatus.Deleting;
        await _fileRecordRepository.UpdateAsync(message.FileId, _ => fileRecord);
        _logger.LogInformation(
            $"Статус файла {message.FileId} успешно обновлён на {fileRecord.Status} " +
            $"по запросу пользователя {message.SenderId}");

        Task.Run(async () =>
        {
            var s3DeletingResult = await _s3FilesService.DeleteFileAsync(fileRecord.ExternalKey);
            if (s3DeletingResult.Succeeded)
            {
                var fileDeletedMessage = new FileDeletedMessage(message.FileId, message.SenderId);
                await _messageProducer.PushFileDeletedMessage(fileDeletedMessage);
                return;
            }

            _logger.LogError(
                $"Не удалось удалить файл {fileRecord.Id} из внешнего хранилища. Ошибка: {s3DeletingResult.Errors[0]}");
            var updateStatusMessage = new UpdateStatusMessage(
                FileId: fileRecord.Id,
                NewStatus: FileStatus.DeletingError,
                SenderId: message.SenderId
            );
            await _messageProducer.PushUpdateFileStatusMessage(updateStatusMessage);
        });
    }

    private async Task HandleFileDeletedMessage(FileDeletedMessage message)
    {
        await _fileRecordRepository.DeleteAsync(message.FileId);
        _logger.LogInformation($"Информация о файле {message.FileId} успешно удалена из базы данных " +
                              $"по запросу пользователя {message.SenderId}");
    }
}