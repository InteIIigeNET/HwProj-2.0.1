using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Repositories;
using HwProj.ContentService.API.Services.Interfaces;

namespace HwProj.ContentService.API.Services.MessageHandlers;

public class DeleteFileMessageHandler : MessageHandlerBase<DeleteFileMessage>
{
    private readonly IS3FilesService _s3FilesService;
    private readonly IMessageProducer _messageProducer;

    public DeleteFileMessageHandler(IFileRecordRepository fileRecordRepository, ILogger logger,
        IMessageProducer messageProducer, IS3FilesService s3FilesService) : base(fileRecordRepository, logger)
    {
        _messageProducer = messageProducer;
        _s3FilesService = s3FilesService;
    }

    public override async Task HandleAsync(DeleteFileMessage message)
    {
        var fileRecord = await FileRecordRepository.GetAsync(message.FileId);
        if (fileRecord.Status is FileStatus.Uploading)
        {
            Logger.LogError($"Ошибка удаления файла {fileRecord.Id}: файл ещё загружается");
            return;
        }

        if (fileRecord.ReferenceCount > 1)
        {
            var newReferenceCount =
                await FileRecordRepository.ReduceReferenceCountAsync(fileRecord, message.FileScope);
            Logger.LogInformation(
                $"Количество ссылок на файл {message.FileId} уменьшено с {fileRecord.ReferenceCount} " +
                $"до {newReferenceCount} по запросу пользователя {message.SenderId}");
            return;
        }

        fileRecord.Status = FileStatus.Deleting;
        await FileRecordRepository.UpdateAsync(message.FileId, _ => fileRecord);
        Logger.LogInformation(
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

            Logger.LogError(
                $"Не удалось удалить файл {fileRecord.Id} из внешнего хранилища. Ошибка: {s3DeletingResult.Errors[0]}");
            var updateStatusMessage = new UpdateStatusMessage(
                FileId: fileRecord.Id,
                NewStatus: FileStatus.DeletingError,
                SenderId: message.SenderId
            );
            await _messageProducer.PushUpdateFileStatusMessage(updateStatusMessage);
        });
    }
}