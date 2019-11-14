using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace HwProj.EventBus
{
    public class EventBusRabbitMQ : IEventBus, IDisposable
    {
        private const string BrokerName = "hwproj_event_bus";

        private readonly DefaultConnection _connection;
        private readonly SubscriptionsManager _subsManager;

        private readonly IServiceProvider _serviceProvider;

        private readonly string _queueName;
        private readonly int _retryCount;

        private  IModel _consumerChannel;

        public EventBusRabbitMQ(DefaultConnection connection, SubscriptionsManager subsManager,
                        IServiceProvider serviceProvider, string queueName, int retryCount = 5)
        {
            _connection = connection;
            _serviceProvider = serviceProvider;
            _subsManager = subsManager;
            _queueName = queueName;
            _retryCount = retryCount;
            _consumerChannel = CreateConsumerChannel();
        }

        public void Publish(IntegrationEvent @event)
        {
            CheckConnection();

            var policy = _connection.GetPolicy(_retryCount);

            using (var channel = _connection.CreateModel())
            {
                channel.ExchangeDeclare(exchange: BrokerName, type: ExchangeType.Direct);

                var message = JsonConvert.SerializeObject(@event);
                var body = Encoding.UTF8.GetBytes(message);

                var eventName = @event.GetType().Name;

                var prop = channel.CreateBasicProperties();
                prop.DeliveryMode = 2;
                prop.Persistent = true;

                policy.Execute(() =>
                {
                    channel.BasicPublish(exchange: BrokerName,
                                    routingKey: eventName,
                                    basicProperties: prop,  
                                    body: body);
                });
            }
        }

        public void Subscribe<TEvent, THandler>()
            where TEvent : IntegrationEvent
            where THandler : IIntegrationEventHandler<TEvent>
        {
            CheckConnection();

            using (var channel = _connection.CreateModel())
            {
                var eventName = typeof(TEvent).Name;

                channel.QueueBind(queue: _queueName, exchange: BrokerName, routingKey: eventName);
            }

            _subsManager.AddSubscription<TEvent, THandler>();
        }

        private IModel CreateConsumerChannel()
        {
            CheckConnection();

            var channel = _connection.CreateModel();

            channel.ExchangeDeclare(exchange: BrokerName, type: ExchangeType.Direct);
            channel.QueueDeclare(queue: _queueName,
                                 durable: true,
                                 exclusive: false,
                                 autoDelete: false,
                                 arguments: null);

            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += async (model, ea) =>
            {
                var eventName = ea.RoutingKey;
                var message = Encoding.UTF8.GetString(ea.Body);

                await ProcessEvent(eventName, message);

                channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
            };
            channel.BasicConsume(queue: _queueName, autoAck: false, consumer: consumer);

            channel.CallbackException += (sender, ea) =>
            {
                _consumerChannel.Dispose();
                _consumerChannel = CreateConsumerChannel();
            };

            return channel;
        }

        private async Task ProcessEvent(string eventName, string message)
        {
            if (_subsManager.HasSubscriptionForEvent(eventName))
            {
                List<Type> handlers = _subsManager.GetHandlersForEvent(eventName);

                var eventType = _subsManager.GetEventTypeByName(eventName);
                var @event = JsonConvert.DeserializeObject(message, eventType);

                foreach (var handler in handlers)
                {
                    var handlerObject = _serviceProvider.GetService(handler);
                    await Task.Run(() => handler.GetMethod("Handle").Invoke(handlerObject, new object[] { @event }));
                }
            }
        }

        public void Dispose()
        {
            _consumerChannel.Dispose();
            _connection.Dispose();
        }

        private void CheckConnection()
        {
            if (!_connection.IsConnected)
            {
                _connection.TryConnect();
            }
        }
    }
}
