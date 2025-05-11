using System.Threading.Channels;
using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Services.Interfaces;

namespace HwProj.ContentService.API.Services;

public class MessageProducer : IMessageProducer
{
    private readonly ChannelWriter<IProcessFileMessage> _channelWriter;
    private readonly ILogger<IMessageProducer> _logger;
    private readonly ILocalFilesService _localFilesService;

    public MessageProducer(ChannelWriter<IProcessFileMessage> channelWriter, ILogger<IMessageProducer> logger,
        ILocalFilesService localFilesService)
    {
        _channelWriter = channelWriter;
        _logger = logger;
        _localFilesService = localFilesService;
    }

    public async Task PushUploadFilesMessages(Scope scope, List<IFormFile> files, string userId)
    {
        foreach (var file in files)
        {
            // Сохраняем файл локально и передаем в канал путь к нему и метаданные
            var localFilePath = await _localFilesService.SaveFile(file, scope);
            var uploadFileMessage = new UploadFileMessage(
                Scope: scope,
                LocalFilePath: localFilePath,
                ContentType: file.ContentType,
                OriginalName: file.FileName,
                SizeInBytes: file.Length,
                SenderId: userId
            );

            await _channelWriter.WriteAsync(uploadFileMessage);
            _logger.LogInformation("В канал опубликована задача на загрузку файла {fileName} пользователем {senderId}",
                uploadFileMessage.OriginalName, uploadFileMessage.SenderId);
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