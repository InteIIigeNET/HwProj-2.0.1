using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Repositories;

namespace HwProj.ContentService.API.Services.MessageHandlers;

public class UpdateStatusMessageHandler : MessageHandlerBase<UpdateStatusMessage>
{
    public UpdateStatusMessageHandler(IFileRecordRepository fileRecordRepository,
        ILogger logger) : base(fileRecordRepository, logger)
    {
    }

    public override async Task HandleAsync(UpdateStatusMessage message)
    {
        var fileRecord = await FileRecordRepository.GetAsync(message.FileId);
        if (fileRecord.Status is FileStatus.Uploading && message.NewStatus is FileStatus.Deleting)
            Logger.LogError($"Ошибка удаления файла {message.FileId}: файл ещё загружается");

        fileRecord.Status = message.NewStatus;
        await FileRecordRepository.UpdateAsync(message.FileId, _ => fileRecord);
        Logger.LogInformation($"Статус файла {message.FileId} успешно обновлён на {message.NewStatus} " +
                               $"по запросу пользователя {message.SenderId}");
    }
}