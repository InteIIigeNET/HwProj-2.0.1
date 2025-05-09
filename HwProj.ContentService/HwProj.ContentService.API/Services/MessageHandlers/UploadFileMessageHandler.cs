using HwProj.ContentService.API.Models;
using HwProj.ContentService.API.Models.Database;
using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Repositories;
using HwProj.ContentService.API.Services.Interfaces;

namespace HwProj.ContentService.API.Services.MessageHandlers;

public class UploadFileMessageHandler : MessageHandlerBase<UploadFileMessage>
{
    private readonly IS3FilesService _s3FilesService;
    private readonly IMessageProducer _messageProducer;
    private readonly IFileKeyService _fileKeyService;

    public UploadFileMessageHandler(IFileRecordRepository fileRecordRepository, ILogger logger,
        IS3FilesService s3FilesService, IMessageProducer messageProducer, 
        IFileKeyService fileKeyService) : base(fileRecordRepository, logger)
    {
        _s3FilesService = s3FilesService;
        _messageProducer = messageProducer;
        _fileKeyService = fileKeyService;
    }

    public override async Task HandleAsync(UploadFileMessage message)
    {
        var fileName = message.FileContent.Name;
        var s3Key = _fileKeyService.BuildFileKey(message.Scope, fileName);

        var fileRecord = new FileRecord
        {
            OriginalName = fileName,
            SizeInKB = Math.Round(message.FileContent.Length / 1024m, 3),
            ExternalKey = s3Key,
        };

        var fileId = await FileRecordRepository.AddWithCourseUnitInfoAsync(fileRecord, message.Scope);
        Logger.LogInformation($"Информация о файле {fileId} успешно добавлена в базу данных");

        Task.Run(async () =>
        {
            var s3UploadingResult =
                await _s3FilesService.UploadFileAsync(message.FileContent, s3Key, message.SenderId);
            if (!s3UploadingResult.Succeeded)
                Logger.LogError($"Не удалось загрузить файл {fileId} во внешнее хранилище. " +
                                $"Ошибка: {s3UploadingResult.Errors[0]}");

            var updateStatusMessage = new UpdateStatusMessage(
                FileId: fileId,
                NewStatus: s3UploadingResult.Succeeded ? FileStatus.ReadyToUse : FileStatus.UploadingError,
                SenderId: message.SenderId
            );
            await _messageProducer.PushUpdateFileStatusMessage(updateStatusMessage);
        });
    }
}