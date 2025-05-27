using System.Threading.Channels;
using HwProj.ContentService.API.Models.Database;
using HwProj.ContentService.API.Models.DTO;
using HwProj.ContentService.API.Models.Enums;
using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Repositories;
using HwProj.ContentService.API.Services.Interfaces;

namespace HwProj.ContentService.API.Services;

public class MessageConsumer : BackgroundService
{
    private readonly ChannelReader<IProcessFileMessage> _channelReader;
    private readonly ILogger<MessageConsumer> _logger;
    private readonly HashSet<long> _filesInProcessing = new();

    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly IMessageProducer _messageProducer;
    private readonly ILocalFilesService _localFilesService;
    private readonly IS3FilesService _s3FilesService;
    private readonly IFileKeyService _fileKeyService;

    public MessageConsumer(ChannelReader<IProcessFileMessage> channelReader, ILogger<MessageConsumer> logger,
        IMessageProducer messageProducer, IS3FilesService s3FilesService, IFileKeyService fileKeyService,
        IServiceScopeFactory serviceScopeFactory, ILocalFilesService localFilesService)
    {
        _channelReader = channelReader;
        _logger = logger;
        _messageProducer = messageProducer;
        _s3FilesService = s3FilesService;
        _fileKeyService = fileKeyService;
        _serviceScopeFactory = serviceScopeFactory;
        _localFilesService = localFilesService;
    }

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Обработчик сообщений MessageConsumer запущен");

        // Можем так сделать, поскольку MessageConsumer работает с базой строго последовательно (последовательно обрабатывает сообщения)
        using var scope = _serviceScopeFactory.CreateScope();
        var fileRecordRepository = scope.ServiceProvider.GetRequiredService<IFileRecordRepository>();

        await foreach (var message in _channelReader.ReadAllAsync(cancellationToken))
        {
            await ProcessMessage(message, fileRecordRepository);
        }
    }
    
    private async Task ProcessMessage(IProcessFileMessage message, IFileRecordRepository fileRecordRepository)
    {
        var processingTask = message switch
        {
            UploadFileMessage uploadFileMessage => HandleUploadFileMessage(uploadFileMessage, fileRecordRepository),
            ReUploadFileMessage reUploadFileMessage => HandleReUploadFileMessage(reUploadFileMessage, fileRecordRepository),
            UpdateStatusMessage updateStatusMessage => HandleUpdateStatusMessage(updateStatusMessage, fileRecordRepository),
            DeleteFileMessage deleteFileMessage => HandleDeleteFileMessage(deleteFileMessage, fileRecordRepository),
            ReDeleteFileMessage reDeleteFileMessage => HandleReDeleteFileMessage(reDeleteFileMessage, fileRecordRepository),
            FileDeletedMessage fileDeletedMessage => HandleFileDeletedMessage(fileDeletedMessage, fileRecordRepository),
            _ => HandleUnknownMessage(message)
        };

        await processingTask;
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Приступаем к завершению работы обработчика сообщений MessageConsumer");
        using var scope = _serviceScopeFactory.CreateScope();
        var fileRecordRepository = scope.ServiceProvider.GetRequiredService<IFileRecordRepository>();

        // Обрабатываем оставшиеся сообщений в канале
        while (_channelReader.TryRead(out var message))
        {
            await ProcessMessage(message, fileRecordRepository);
        }

        // Ждем завершения всех дополнительных задач
        while (_filesInProcessing.Count > 0)
        {
        }

        // Ещё раз обрабатываем оставшиеся сообщения в канале, поскольку некоторые задачи содержат отправку сообщения
        while (_channelReader.TryRead(out var message))
        {
            await ProcessMessage(message, fileRecordRepository);
        }

        _logger.LogInformation("Канал сообщений пуст, обработчик MessageConsumer успешно приостановлен");
    }

    private Task HandleUnknownMessage(IProcessFileMessage message)
    {
        _logger.LogWarning("Необработанное сообщение типа {messageType} от пользователя {senderId}",
            message.GetType().Name, message.SenderId);
        return Task.CompletedTask;
    }
    
    private async Task HandleUploadFileMessage(UploadFileMessage message, IFileRecordRepository fileRecordRepository)
    {
        // Создаем запись о файле в БД
        var fileRecord = new FileRecord
        {
            Status = FileStatus.Uploading,
            ReferenceCount = 1,
            OriginalName = message.OriginalName,
            SizeInBytes = message.SizeInBytes,
            ContentType = message.ContentType
        };
        var fileRecordId = await fileRecordRepository.AddWithCourseUnitInfoAsync(fileRecord, message.Scope);

        // Формируем и устанавливаем ключ для S3, содержащий id записи файла
        var s3Key = _fileKeyService.BuildFileKey(message.Scope, message.OriginalName, fileRecordId);
        await fileRecordRepository.UpdateAsync(fileRecordId,
            setters => setters.SetProperty(fr => fr.ExternalKey, s3Key));

        _logger.LogInformation("Информация о файле {fileId} от пользователя {senderId} успешно добавлена в базу данных",
            fileRecordId, message.SenderId);
        
        // Формируем модель и отправляем задачу на загрузку файла, не блокируя Consumer
        var uploadFileTaskDto = new UploadFileTaskDto(
            FileRecordId: fileRecordId,
            LocalFilePath: message.LocalFilePath,
            ContentType: message.ContentType,
            ExternalKey: s3Key,
            UploaderId: message.SenderId
        );
        
        // А также сигнализируем, что для fileRecordId есть задача, завершения которой нужно дождаться при остановке сервиса
        _filesInProcessing.Add(fileRecordId);
        
        UploadFileTask(uploadFileTaskDto);
    }
    
    private async Task HandleReUploadFileMessage(ReUploadFileMessage message, IFileRecordRepository fileRecordRepository)
    {
        var fileRecord = await fileRecordRepository.GetFileRecordByIdAsync(message.FileId);
        if (fileRecord is null)
        {
            _logger.LogError(
                "При обработке сообщения на повторную загрузку файла (запрос пользователя {senderId}) в БД не найдена запись FileRecord для файла с id {fileId}",
                message.SenderId, message.FileId);
            return;
        }

        // Сигнализируем, что для fileRecord.Id есть задача, завершения которой нужно дождаться при остановке сервиса
        _filesInProcessing.Add(fileRecord.Id);

        // Не блокируя Consumer, начинаем взаимодействие с удаленным S3 по вопросу этого файла
        Task.Run(async () =>
        {
            // Если файл уже есть в s3, осталось просто обновить статус
            var isInS3 = await _s3FilesService.CheckFileExistence(fileRecord.ExternalKey!);
            if (isInS3)
            {
                var updateStatusMessage = new UpdateStatusMessage(
                    FileId: fileRecord.Id,
                    NewStatus: FileStatus.ReadyToUse,
                    LocalFilePath: null,
                    SenderId: message.SenderId
                );
                await _messageProducer.PushUpdateFileStatusMessage(updateStatusMessage);
                return;
            }

            // Иначе формируем модель и отправляем стандартную задачу на загрузку
            var uploadFileTaskDto = new UploadFileTaskDto(
                FileRecordId: fileRecord.Id,
                LocalFilePath: fileRecord.LocalPath,
                ContentType: fileRecord.ContentType,
                ExternalKey: fileRecord.ExternalKey!,
                UploaderId: message.SenderId
            );
            await UploadFileTask(uploadFileTaskDto);
        });
    }

    private async Task HandleUpdateStatusMessage(UpdateStatusMessage message,
        IFileRecordRepository fileRecordRepository)
    {
        await fileRecordRepository.UpdateAsync(message.FileId,
            setters => setters.SetProperty(fr => fr.Status, message.NewStatus));
        _logger.LogInformation(
            "Статус файла {fileId} успешно обновлён на {newStatus} по запросу пользователя {senderId}",
            message.FileId, message.NewStatus, message.SenderId);

        // Если файл перешёл в статус ReadyToUse, то удаляем его из локального хранилища
        if (message.NewStatus is FileStatus.ReadyToUse && !string.IsNullOrEmpty(message.LocalFilePath))
            if (_localFilesService.DeleteFile(message.LocalFilePath).Succeeded)
            {
                _logger.LogInformation("Файл {fileId} удален из локального хранилища по пути {filePath}",
                    message.FileId, message.LocalFilePath);
                
                // Удаляем больше не актуальный путь к локальному файлу
                await fileRecordRepository.UpdateAsync(message.FileId,
                    setters => setters.SetProperty(fr => fr.LocalPath, string.Empty));
            }
    }

    private async Task HandleDeleteFileMessage(DeleteFileMessage message, IFileRecordRepository fileRecordRepository)
    {
        var fileRecord = await fileRecordRepository.GetFileRecordByIdAsync(message.FileId);
        if (fileRecord is null)
        {
            _logger.LogError(
                "При обработке сообщения на удаление файла (запрос пользователя {senderId}) в БД не найдена запись FileRecord для файла с id {fileId}",
                message.SenderId, message.FileId);
            return;
        }

        if (fileRecord.Status is FileStatus.Uploading)
        {
            _logger.LogError("Ошибка удаления файла {fileId} пользователем {senderId}: файл ещё загружается",
                fileRecord.Id, message.SenderId);
            return;
        }

        if (fileRecord.ReferenceCount > 1)
        {
            var newReferenceCount =
                await fileRecordRepository.ReduceReferenceCountAsync(fileRecord, message.FileScope);
            _logger.LogInformation("Количество ссылок на файл {fileId} уменьшено с {previousReferenceCount} " +
                                   "до {newReferenceCount} по запросу пользователя {senderId}",
                message.FileId, fileRecord.ReferenceCount, newReferenceCount, message.SenderId);
            return;
        }

        await fileRecordRepository.UpdateAsync(message.FileId,
            setters => setters.SetProperty(fr => fr.Status, FileStatus.Deleting));
        _logger.LogInformation(
            "Статус файла {fileId} успешно обновлён на {status} по запросу пользователя {senderId}",
            message.FileId, fileRecord.Status.ToString(), message.SenderId);

        // Сигнализируем, что для message.FileId есть задача, завершения которой нужно дождаться при остановке сервиса
        _filesInProcessing.Add(message.FileId);

        DeleteFileTask(message.FileId, fileRecord.ExternalKey!, message.SenderId);
    }

    private async Task HandleReDeleteFileMessage(ReDeleteFileMessage message, IFileRecordRepository fileRecordRepository)
    {
        var fileRecord = await fileRecordRepository.GetFileRecordByIdAsync(message.FileId);
        if (fileRecord is null)
        {
            _logger.LogError(
                "При обработке сообщения на повторное удаление файла (запрос пользователя {senderId}) в БД не найдена запись FileRecord для файла с id {fileId}",
                message.SenderId, message.FileId);
            return;
        }
        
        // Сигнализируем, что для fileRecord.Id есть задача, завершения которой нужно дождаться при остановке сервиса
        _filesInProcessing.Add(fileRecord.Id);

        // Не блокируя Consumer, начинаем взаимодействие с удаленным S3 по вопросу этого файла
        Task.Run(async () =>
        {
            // Если файла уже нет в s3, осталось просто отправить сообщение для удаления записи файла из БД
            var isInS3 = await _s3FilesService.CheckFileExistence(fileRecord.ExternalKey!);
            if (!isInS3)
            {
                var fileDeletedMessage = new FileDeletedMessage(
                    FileId: fileRecord.Id,
                    SenderId: message.SenderId
                );
                await _messageProducer.PushFileDeletedMessage(fileDeletedMessage);
                return;
            }

            // Иначе отправляем стандартную задачу на удаление
            await DeleteFileTask(fileRecord.Id, fileRecord.ExternalKey!, message.SenderId);
        });
    }

    private async Task HandleFileDeletedMessage(FileDeletedMessage message, IFileRecordRepository fileRecordRepository)
    {
        await fileRecordRepository.DeleteWithCourseUnitInfoAsync(message.FileId);
        _logger.LogInformation(
            "Информация о файле {fileId} успешно удалена из базы данных по запросу пользователя {senderId}",
            message.FileId, message.SenderId);
    }

    private async Task UploadFileTask(UploadFileTaskDto uploadFileTaskDto)
    {
        // Загружаем в S3
        var fileReadStream = _localFilesService.GetFileStream(uploadFileTaskDto.LocalFilePath);
        var uploadFileToS3Dto = new UploadFileToS3Dto(
            FileStream: fileReadStream,
            ContentType: uploadFileTaskDto.ContentType,
            ExternalKey: uploadFileTaskDto.ExternalKey,
            UploaderId: uploadFileTaskDto.UploaderId
        );
        var s3UploadingResult = await _s3FilesService.UploadFileAsync(uploadFileToS3Dto);
        await fileReadStream.DisposeAsync();

        if (!s3UploadingResult.Succeeded)
            _logger.LogError("Не удалось загрузить файл {fileId} во внешнее хранилище. Ошибка: {error}",
                uploadFileTaskDto.FileRecordId, s3UploadingResult.Errors[0]);

        // Отправляем сообщение на обновление статуса файла в БД в соответствии с результатом загрузки
        var updateStatusMessage = new UpdateStatusMessage(
            FileId: uploadFileTaskDto.FileRecordId,
            NewStatus: s3UploadingResult.Succeeded ? FileStatus.ReadyToUse : FileStatus.UploadingError,
            LocalFilePath: uploadFileTaskDto.LocalFilePath,
            SenderId: uploadFileToS3Dto.UploaderId
        );
        await _messageProducer.PushUpdateFileStatusMessage(updateStatusMessage);

        // Задача для fileId завершена, новое сообщение отправлено в канал
        _filesInProcessing.Remove(uploadFileTaskDto.FileRecordId);
    }

    private async Task DeleteFileTask(long fileId, string s3Key, string senderId)
    {
        var s3DeletingResult = await _s3FilesService.DeleteFileAsync(s3Key);
        if (s3DeletingResult.Succeeded)
        {
            var fileDeletedMessage = new FileDeletedMessage(fileId, senderId);
            await _messageProducer.PushFileDeletedMessage(fileDeletedMessage);

            // Задача для message.FileId завершена, новое сообщение отправлено в канал
            _filesInProcessing.Remove(fileId);
            return;
        }

        _logger.LogError("Не удалось удалить файл {fileId} из внешнего хранилища по запросу пользователя {senderId}. " +
                         "Ошибка: {error}", fileId, senderId, s3DeletingResult.Errors[0]);
        var updateStatusMessage = new UpdateStatusMessage(
            FileId: fileId,
            NewStatus: FileStatus.DeletingError,
            LocalFilePath: null,
            SenderId: senderId
        );
        await _messageProducer.PushUpdateFileStatusMessage(updateStatusMessage);

        // Задача для message.FileId завершена, новое сообщение отправлено в канал
        _filesInProcessing.Remove(fileId);
    }
}