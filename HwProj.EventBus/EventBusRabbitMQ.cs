using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HwProj.EventBus.Abstractions;
using Microsoft.AspNetCore.DataProtection;
using Polly.Retry;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.EventBus
{
    public class EventBusRabbitMq : IEventBus, IDisposable
    {
        private const string BrokerName = "hwproj_event_bus";

        private readonly IDefaultConnection _connection;
        private readonly IServiceProvider _serviceProvider;

        private readonly string _queueName;
        private readonly RetryPolicy _policy;

        private  IModel _consumerChannel;

        public EventBusRabbitMq(IDefaultConnection connection, IServiceProvider serviceProvider, RetryPolicy policy)
        {
            _connection = connection;
            _serviceProvider = serviceProvider;
            _queueName = _serviceProvider.GetApplicationUniqueIdentifier().Split('\\').Last();
            _policy = policy;
            _consumerChannel = CreateConsumerChannel();
        }

        public void Publish(Event.Event @event)
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

        public void Subscribe<TEvent>()
            where TEvent : Event.Event
        {
            using (var channel = _connection.CreateModel())
            {
                var eventName = GetEventName<TEvent>();
                channel.QueueBind(queue: _queueName, exchange: BrokerName, routingKey: eventName);
            }
            StartBasicConsume();
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

        private void StartBasicConsume()
        {
            var consumer = new EventingBasicConsumer(_consumerChannel);
            consumer.Received += Consumer_Received;
            _consumerChannel.BasicConsume(queue: _queueName, autoAck: false, consumer: consumer);
        }

        private async void Consumer_Received(object sender, BasicDeliverEventArgs eventArgs)
        {
            var eventName = eventArgs.RoutingKey;
            var message = Encoding.UTF8.GetString(eventArgs.Body);

            await ProcessEvent(eventName, message).ConfigureAwait(false);

            _consumerChannel.BasicAck(deliveryTag: eventArgs.DeliveryTag, multiple: false);
        }

        private async Task ProcessEvent(string eventName, string message)
        {
            var types = AppDomain.CurrentDomain.GetAssemblies().SelectMany(x => x.GetTypes()).ToList();
            var eventType = types.First(x => x.Name == eventName);
            var @event = JsonConvert.DeserializeObject(message, eventType) as Event.Event;
            var fullTypeInterface = typeof(IEventHandler<>).MakeGenericType(eventType);
            var handlers = types.Where(x => fullTypeInterface.IsAssignableFrom(x) && !x.IsInterface && !x.IsAbstract);

            using (var scope = _serviceProvider.CreateScope())
            {
                foreach (var handler in handlers)
                {
                    //var handlerObject = _serviceProvider.GetService(handler); Это для теста
                    var handlerObject = scope.ServiceProvider.GetRequiredService(handler);
                    await Task.Run(() => handler.GetMethod("HandleAsync")?
                            .Invoke(handlerObject, new object[] { @event }))
                            .ConfigureAwait(false);
                }
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
