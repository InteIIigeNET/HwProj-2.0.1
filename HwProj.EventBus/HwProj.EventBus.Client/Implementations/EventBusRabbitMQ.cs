using System.Text;
using HwProj.EventBus.Client.Interfaces;
using Newtonsoft.Json;
using Polly.Retry;
using RabbitMQ.Client;

namespace HwProj.EventBus.Client.Implementations
{
    public class EventBusRabbitMq : IEventBus
    {
        internal const string BrokerName = "hwproj_event_bus";

        private readonly IDefaultConnection _connection;
        private readonly RetryPolicy _policy;

        public EventBusRabbitMq(IDefaultConnection connection, RetryPolicy policy)
        {
            _connection = connection;
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
    }
}
