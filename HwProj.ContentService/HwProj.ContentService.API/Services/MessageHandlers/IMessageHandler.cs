using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Repositories;

namespace HwProj.ContentService.API.Services.MessageHandlers;

public interface IMessageHandler<in TMessage> where TMessage : IProcessFileMessage
{
    public Task HandleAsync(TMessage message);
}

public abstract class MessageHandlerBase<TMessage> : IMessageHandler<TMessage>
    where TMessage : IProcessFileMessage
{
    protected readonly IFileRecordRepository FileRecordRepository;
    protected readonly ILogger Logger;

    protected MessageHandlerBase(IFileRecordRepository fileRecordRepository, ILogger logger)
    {
        FileRecordRepository = fileRecordRepository;
        Logger = logger;
    }

    public abstract Task HandleAsync(TMessage message);
}