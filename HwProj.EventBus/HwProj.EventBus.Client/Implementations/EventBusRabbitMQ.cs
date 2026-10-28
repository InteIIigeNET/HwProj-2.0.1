using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Polly.Retry;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace HwProj.EventBus.Client.Implementations
{
    public class EventBusRabbitMq : IEventBus, IDisposable
    {
        private const string BrokerName = "hwproj_event_bus";
        private const ushort PrefetchCount = 10;

        private readonly IDefaultConnection _connection;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<EventBusRabbitMq> _logger;

        private readonly string _queueName;
        private readonly RetryPolicy _policy;

        private readonly object _lock = new object();
        private IModel? _consumerChannel;
        private bool _isConsuming;

        private readonly Dictionary<string, Type> _eventTypes = new Dictionary<string, Type>();

        private readonly Dictionary<string, List<Type>> _handlers =
            new Dictionary<string, List<Type>>();

        public EventBusRabbitMq(IDefaultConnection connection, IConfiguration configuration,
            IServiceScopeFactory scopeFactory, RetryPolicy policy, ILogger<EventBusRabbitMq> logger)
        {
            _connection = connection;
            _scopeFactory = scopeFactory;
            _logger = logger;
            _queueName = configuration.GetSection("EventBus")["EventBusQueueName"];
            _policy = policy;
        }

        public void Publish(Event @event)
        {
            using (var channel = _connection.CreateModel())
            {
                channel.ExchangeDeclare(exchange: BrokerName, type: ExchangeType.Direct, durable: true);

                var message = JsonConvert.SerializeObject(@event);
                var body = Encoding.UTF8.GetBytes(message);
                var eventName = @event.GetType().Name;

                var properties = channel.CreateBasicProperties();
                properties.Persistent = true;

                _policy.Execute(() =>
                {
                    channel.BasicPublish(exchange: BrokerName,
                        routingKey: eventName,
                        mandatory: true,
                        basicProperties: properties,
                        body: body);
                });
            }
        }

        public IEventBusSubscriber CreateSubscriber() => new EventBusSubscriber(this);

        internal void Subscribe<TEvent, THandler>()
            where TEvent : Event
            where THandler : EventHandlerBase<TEvent>
        {
            var eventName = GetEventName<TEvent>();
            lock (_lock)
            {
                var channel = GetOrCreateConsumerChannel();
                if (!_handlers.TryGetValue(eventName, out var handlers))
                {
                    handlers = new List<Type>();
                    _handlers.Add(eventName, handlers);
                }

                if (handlers.Contains(typeof(THandler))) return;

                handlers.Add(typeof(THandler));
                _eventTypes[eventName] = typeof(TEvent);
                channel.QueueBind(queue: _queueName, exchange: BrokerName, routingKey: eventName);
            }
        }

        // Канал консьюмера создаётся лениво: сервисам, которые только публикуют события,
        // не нужно держать открытый канал и объявлять свою очередь
        private IModel GetOrCreateConsumerChannel()
        {
            if (_consumerChannel != null) return _consumerChannel;

            var channel = _connection.CreateModel();

            channel.ExchangeDeclare(exchange: BrokerName, type: ExchangeType.Direct, durable: true);
            channel.QueueDeclare(queue: _queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null);
            channel.BasicQos(prefetchSize: 0, prefetchCount: PrefetchCount, global: false);

            return _consumerChannel = channel;
        }

        internal void StartBasicConsume()
        {
            lock (_lock)
            {
                if (_isConsuming) return;

                var channel = GetOrCreateConsumerChannel();
                var consumer = new AsyncEventingBasicConsumer(channel);
                consumer.Received += (_, eventArgs) => Consumer_Received(channel, eventArgs);
                channel.BasicConsume(queue: _queueName, autoAck: false, consumer: consumer);
                _isConsuming = true;
            }
        }

        private async Task Consumer_Received(IModel channel, BasicDeliverEventArgs eventArgs)
        {
            var eventName = eventArgs.RoutingKey;
            try
            {
                var message = Encoding.UTF8.GetString(eventArgs.Body);
                await ProcessEvent(eventName, message);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Не удалось обработать событие {EventName}", eventName);
            }

            // Подтверждаем сообщение в любом случае: ошибки обработчиков уже залогированы,
            // а повторная доставка привела бы к повторному запуску успешно отработавших обработчиков
            channel.BasicAck(deliveryTag: eventArgs.DeliveryTag, multiple: false);
        }

        private async Task ProcessEvent(string eventName, string message)
        {
            Type[] handlers;
            Type eventType;
            lock (_lock)
            {
                if (!_handlers.TryGetValue(eventName, out var eventHandlers) ||
                    !_eventTypes.TryGetValue(eventName, out eventType)) return;
                handlers = eventHandlers.ToArray();
            }

            if (!(JsonConvert.DeserializeObject(message, eventType) is Event @event)) return;

            using var scope = _scopeFactory.CreateScope();
            foreach (var handler in handlers)
            {
                try
                {
                    var eventHandler = (IEventHandler<Event>)scope.ServiceProvider.GetRequiredService(handler);
                    await eventHandler.HandleAsync(@event);
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Обработчик {Handler} упал при обработке события {EventName} ({EventId})",
                        handler.Name, eventName, @event.Id);
                }
            }
        }

        public void Dispose()
        {
            lock (_lock)
            {
                _consumerChannel?.Dispose();
                _consumerChannel = null;
            }
        }

        private static string GetEventName<TEvent>()
        {
            return typeof(TEvent).Name;
        }
    }
}
