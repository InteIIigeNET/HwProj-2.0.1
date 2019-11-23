using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Polly.Retry;
using Microsoft.AspNetCore;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.EventBus
{
    public class EventBusRabbitMQ : IEventBus, IDisposable
    {
        private const string BrokerName = "hwproj_event_bus";

        private readonly IDefaultConnection _connection;
        private readonly ISubscriptionsManager _subsManager;
        private readonly IServiceProvider _serviceProvider;

        private readonly string _queueName;
        private readonly RetryPolicy _policy;

        private  IModel _consumerChannel;

        public EventBusRabbitMQ(IDefaultConnection connection, ISubscriptionsManager subsManager,
                        IServiceProvider serviceProvider, string queueName, RetryPolicy policy)
        {
            _connection = connection;
            _serviceProvider = serviceProvider;
            _subsManager = subsManager;
            _queueName = queueName;
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

        public void Subscribe<TEvent, THandler>()
            where TEvent : Event
            where THandler : IEventHandler<TEvent>
        {
            using (var channel = _connection.CreateModel())
            {
                var eventName = _subsManager.GetEventName<TEvent>();
                channel.QueueBind(queue: _queueName, exchange: BrokerName, routingKey: eventName);
            }

            _subsManager.AddSubscription<TEvent, THandler>();
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
            var handlers = _subsManager.GetHandlersForEvent(eventName);
            var eventType = _subsManager.GetEventTypeByName(eventName);
            var @event = JsonConvert.DeserializeObject(message, eventType) as Event;

            using (var scope = _serviceProvider.CreateScope())
            {
                foreach (var handler in handlers)
                {
                    var handlerObject = scope.ServiceProvider.GetRequiredService(handler);
                    //var handlerObject = _serviceProvider.GetService(handler); Это для тестов
                    await Task.Run(() => handler.GetMethod("HandleAsync").Invoke(handlerObject, new object[] { @event }));
                }
            }
        }

        public void Dispose()
        {
            _consumerChannel.Close();
            _connection.Dispose();
        }
    }
}
