using System.Threading.Channels;
using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Services.MessageHandlers;

namespace HwProj.ContentService.API.Services;

public class MessageConsumer : BackgroundService
{
    private readonly ChannelReader<IProcessFileMessage> _channelReader;
    
    private readonly IServiceProvider _serviceProvider;
    private readonly Dictionary<Type, object> _messageHandlers = new();

    public MessageConsumer(ChannelReader<IProcessFileMessage> channelReader, IServiceProvider serviceProvider)
    {
        _channelReader = channelReader;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        await foreach (var message in _channelReader.ReadAllAsync(cancellationToken))
        {
            var messageType = message.GetType();
            if (!_messageHandlers.TryGetValue(messageType, out var handler))
            {
                var handlerType = typeof(IMessageHandler<>).MakeGenericType(messageType);
                handler = _serviceProvider.GetRequiredService(handlerType);
                _messageHandlers.TryAdd(messageType, handler);
            }
            
            await ((IMessageHandler<IProcessFileMessage>)handler).HandleAsync(message);
        }
    }
}