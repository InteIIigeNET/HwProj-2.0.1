using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace HwProj.EventBus.Client.Implementations
{
    /// <summary>
    /// Читает очередь сервиса и передаёт события подписанным обработчикам.
    /// Запускается и останавливается хостом вместе с приложением.
    /// </summary>
    internal class EventBusConsumer : IHostedService
    {
        private const ushort PrefetchCount = 10;

        private readonly IDefaultConnection _connection;
        private readonly EventSubscriptions _subscriptions;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<EventBusConsumer> _logger;
        private readonly string _queueName;

        // Сообщения обрабатываются по одному; семафор позволяет при остановке дождаться текущего
        private readonly SemaphoreSlim _processingLock = new SemaphoreSlim(1, 1);
        private volatile bool _isStopping;
        private IModel? _channel;

        public EventBusConsumer(IDefaultConnection connection, EventSubscriptions subscriptions,
            IServiceScopeFactory scopeFactory, IConfiguration configuration, ILogger<EventBusConsumer> logger)
        {
            _connection = connection;
            _subscriptions = subscriptions;
            _scopeFactory = scopeFactory;
            _logger = logger;
            _queueName = configuration.GetSection("EventBus")["EventBusQueueName"];
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            var channel = _connection.CreateModel();

            channel.ExchangeDeclare(exchange: EventBusRabbitMq.BrokerName, type: ExchangeType.Direct, durable: true);
            channel.QueueDeclare(queue: _queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null);

            foreach (var eventName in _subscriptions.EventNames)
            {
                channel.QueueBind(queue: _queueName, exchange: EventBusRabbitMq.BrokerName, routingKey: eventName);
            }

            channel.BasicQos(prefetchSize: 0, prefetchCount: PrefetchCount, global: false);

            var consumer = new AsyncEventingBasicConsumer(channel);
            consumer.Received += (_, eventArgs) => OnReceived(channel, eventArgs);
            channel.BasicConsume(queue: _queueName, autoAck: false, consumer: consumer);

            _channel = channel;
            return Task.CompletedTask;
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            if (_channel == null) return;

            _isStopping = true;
            try
            {
                await _processingLock.WaitAsync(cancellationToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Не дождались завершения обработки события при остановке");
            }
            finally
            {
                // Неподтверждённые сообщения брокер вернёт в очередь
                _channel.Dispose();
                _channel = null;
            }
        }

        private async Task OnReceived(IModel channel, BasicDeliverEventArgs eventArgs)
        {
            await _processingLock.WaitAsync();
            try
            {
                if (_isStopping) return;

                var eventName = eventArgs.RoutingKey;
                try
                {
                    if (_subscriptions.TryGet(eventName, out var subscription))
                        await subscription.HandleAsync(Encoding.UTF8.GetString(eventArgs.Body), _scopeFactory, _logger);
                    else
                        _logger.LogWarning("Нет обработчиков для события {EventName}", eventName);
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Не удалось обработать событие {EventName}", eventName);
                }

                // Подтверждаем сообщение в любом случае: ошибки обработчиков уже залогированы,
                // а повторная доставка привела бы к повторному запуску успешно отработавших обработчиков
                channel.BasicAck(deliveryTag: eventArgs.DeliveryTag, multiple: false);
            }
            finally
            {
                _processingLock.Release();
            }
        }
    }
}
