using System.Threading.Channels;
using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Services.Interfaces;

namespace HwProj.ContentService.API.Services;

public class MessageProducer : IMessageProducer
{
    private readonly ChannelWriter<IProcessFileMessage> _channelWriter;
    private readonly ILogger<IMessageProducer> _logger;

    public MessageProducer(ChannelWriter<IProcessFileMessage> channelWriter, ILogger<IMessageProducer> logger)
    {
        _channelWriter = channelWriter;
        _logger = logger;
    }

    public async Task PushUploadFilesMessages(List<UploadFileMessage> messages)
    {
        foreach (var uploadFileMessage in messages)
        {
            await _channelWriter.WriteAsync(uploadFileMessage);
            _logger.LogInformation("В канал опубликована задача на загрузку файла {fileName} пользователем {senderId}",
                uploadFileMessage.OriginalName, uploadFileMessage.SenderId);
        }
    }

    public async Task PushReUploadFilesMessages(List<long> fileIds, string userId)
    {
        foreach (var fileId in fileIds)
        {
            var reUploadFileMessage = new ReUploadFileMessage(
                FileId: fileId,
                SenderId: userId
            );

            await _channelWriter.WriteAsync(reUploadFileMessage);
            _logger.LogInformation(
                "В канал опубликована задача на повторную загрузку файла {fileId} пользователем {senderId}",
                fileId, userId);
        }
    }

    public async Task PushDeleteFilesMessages(Scope filesScope, List<long> fileIds, string userId)
    {
        var startDeletingFileMessages = fileIds.Select(fileId =>
            new DeleteFileMessage(
                FileId: fileId,
                FileScope: filesScope,
                SenderId: userId
            ));

        foreach (var startDeletingFileMessage in startDeletingFileMessages)
        {
            await _channelWriter.WriteAsync(startDeletingFileMessage);
            _logger.LogInformation("В канал опубликована задача на удаление файла {fileId} пользователем {senderId}",
                startDeletingFileMessage.FileId, startDeletingFileMessage.SenderId);
        }
    }

    public async Task PushReDeleteFilesMessages(List<long> fileIds, string userId)
    {
        foreach (var fileId in fileIds)
        {
            var reDeleteFileMessage = new ReDeleteFileMessage(
                FileId: fileId,
                SenderId: userId
            );

            await _channelWriter.WriteAsync(reDeleteFileMessage);
            _logger.LogInformation(
                "В канал опубликована задача на повторное удаление файла {fileId} пользователем {senderId}",
                fileId, userId);
        }
    }

    public async Task PushFileDeletedMessage(FileDeletedMessage fileDeletedMessage)
    {
        await _channelWriter.WriteAsync(fileDeletedMessage);
        _logger.LogInformation("В канал опубликована задача на удаление записи файла {fileId} пользователем {senderId}",
            fileDeletedMessage.FileId, fileDeletedMessage.SenderId);
    }

    public async Task PushUpdateFileStatusMessage(UpdateStatusMessage updateStatusMessage)
    {
        await _channelWriter.WriteAsync(updateStatusMessage);
        _logger.LogInformation(
            "В канал опубликована задача на обновление статуса файла {fileId} на {newStatus} пользователем {senderId}",
            updateStatusMessage.FileId, updateStatusMessage.NewStatus.ToString(), updateStatusMessage.SenderId);
    }
}