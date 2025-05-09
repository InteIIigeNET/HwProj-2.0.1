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

    public async Task PushUploadFilesMessages(Scope scope, List<IFormFile> files, string userId)
    {
        var uploadFileMessages = files.Select(f =>
            new UploadFileMessage(
                Scope: scope,
                FileContent: f,
                SenderId: userId
            ));

        try
        {
            await Parallel.ForEachAsync(
                uploadFileMessages,
                async (uploadFileMessage, cancellationToken) =>
                {
                    await _channelWriter.WriteAsync(uploadFileMessage, cancellationToken);
                    _logger.LogInformation("В канал опубликована задача на загрузку файла {fileName}",
                        uploadFileMessage.FileContent.FileName);
                });
        }
        catch (ChannelClosedException ex)
        {
            _logger.LogError(ex, "Канал был закрыт во время публикации задач на загрузку файлов");
            throw;
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

        try
        {
            await Parallel.ForEachAsync(
                startDeletingFileMessages,
                async (startDeletingFileMessage, cancellationToken) =>
                {
                    await _channelWriter.WriteAsync(startDeletingFileMessage, cancellationToken);
                    _logger.LogInformation(
                        $"В канал опубликована задача на удаление файла {startDeletingFileMessage.FileId}");
                });
        }
        catch (ChannelClosedException ex)
        {
            _logger.LogError(ex, "Канал был закрыт во время публикации задач на удаление файлов");
            throw;
        }
    }

    public async Task PushFileDeletedMessage(FileDeletedMessage fileDeletedMessage)
    {
        try
        {
            await _channelWriter.WriteAsync(fileDeletedMessage);
            _logger.LogInformation(
                $"В канал опубликована задача на удаление записи файла {fileDeletedMessage.FileId}");
        }
        catch (ChannelClosedException ex)
        {
            _logger.LogError(ex,
                $"Канал был закрыт во время публикации задачи на удаление записи файла {fileDeletedMessage.FileId}");
            throw;
        }
    }

    public async Task PushUpdateFileStatusMessage(UpdateStatusMessage updateStatusMessage)
    {
        try
        {
            await _channelWriter.WriteAsync(updateStatusMessage);
            _logger.LogInformation(
                $"В канал опубликована задача на обновление статуса файла {updateStatusMessage.FileId}");
        }
        catch (ChannelClosedException ex)
        {
            _logger.LogError(ex,
                $"Канал был закрыт во время публикации задачи на обновление статуса файла {updateStatusMessage.FileId}");
            throw;
        }
    }
}