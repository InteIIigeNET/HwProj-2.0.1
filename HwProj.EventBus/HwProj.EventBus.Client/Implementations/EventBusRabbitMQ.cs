using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Polly.Retry;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace HwProj.EventBus.Client.Implementations
{
    public class EventBusRabbitMq : IEventBus, IDisposable
    {
        private const string BrokerName = "hwproj_event_bus";

        private readonly IDefaultConnection _connection;
        private readonly IServiceScopeFactory _scopeFactory;

        private readonly string _queueName;
        private readonly RetryPolicy _policy;

        private IModel _consumerChannel;

        private readonly Dictionary<string, Type> _eventTypes = new Dictionary<string, Type>();

        private readonly Dictionary<string, List<Type>> _handlers =
            new Dictionary<string, List<Type>>();

        public EventBusRabbitMq(IDefaultConnection connection, IServiceProvider serviceProvider,
            IServiceScopeFactory scopeFactory, RetryPolicy policy)
        {
            _connection = connection;
            _scopeFactory = scopeFactory;
            _queueName = serviceProvider.GetApplicationUniqueIdentifier().Split('\\').Last();
            _policy = policy;
            _consumerChannel = CreateConsumerChannel();
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
            using var channel = _connection.CreateModel();
            var eventName = GetEventName<TEvent>();
            if (!_handlers.TryGetValue(eventName, out var handlers))
            {
                handlers = new List<Type>();
                _handlers.Add(eventName, handlers);
            }

            handlers.Add(typeof(THandler));
            _eventTypes[eventName] = typeof(TEvent);
            channel.QueueBind(queue: _queueName, exchange: BrokerName, routingKey: eventName);
        }

        private IModel CreateConsumerChannel()
        {
            var channel = _connection.CreateModel();

            channel.ExchangeDeclare(exchange: BrokerName, type: ExchangeType.Direct, durable: true);
            channel.QueueDeclare(queue: _queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null);

            channel.CallbackException += (sender, ea) =>
            {
                _consumerChannel.Close();
                _consumerChannel = CreateConsumerChannel();
                StartBasicConsume();
            };

            return channel;
        }

        internal void StartBasicConsume()
        {
            var consumer = new EventingBasicConsumer(_consumerChannel);
            consumer.Received += Consumer_Received;
            _consumerChannel.BasicConsume(queue: _queueName, autoAck: false, consumer: consumer);
        }

        private async void Consumer_Received(object sender, BasicDeliverEventArgs eventArgs)
        {
            var eventName = eventArgs.RoutingKey;
            var message = Encoding.UTF8.GetString(eventArgs.Body);

            await ProcessEvent(eventName, message);

            _consumerChannel.BasicAck(deliveryTag: eventArgs.DeliveryTag, multiple: false);
        }

        private async Task ProcessEvent(string eventName, string message)
        {
            if (!_handlers.TryGetValue(eventName, out var handlers) ||
                !_eventTypes.TryGetValue(eventName, out var eventType) ||
                !(JsonConvert.DeserializeObject(message, eventType) is Event @event)) return;

            //TODO: log
            using var scope = _scopeFactory.CreateScope();
            foreach (var handler in handlers)
            {
                var eventHandler = scope.ServiceProvider.GetRequiredService(handler) as IEventHandler<Event>;
                await eventHandler?.HandleAsync(@event);
            }
        }

        public void Dispose()
        {
            _consumerChannel.Close();
            _connection.Dispose();
        }

        private static string GetEventName<TEvent>()
        {
            return typeof(TEvent).Name;
        }
    }
}
