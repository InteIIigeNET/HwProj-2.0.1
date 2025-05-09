using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Repositories;

namespace HwProj.ContentService.API.Services.MessageHandlers;

public class FileDeletedMessageHandler : MessageHandlerBase<FileDeletedMessage>
{
    public FileDeletedMessageHandler(IFileRecordRepository fileRecordRepository,
        ILogger logger) : base(fileRecordRepository, logger)
    {
    }

    public override async Task HandleAsync(FileDeletedMessage message)
    {
        await FileRecordRepository.DeleteAsync(message.FileId);
        Logger.LogInformation($"Информация о файле {message.FileId} успешно удалена из базы данных " +
                               $"по запросу пользователя {message.SenderId}");
    }
}