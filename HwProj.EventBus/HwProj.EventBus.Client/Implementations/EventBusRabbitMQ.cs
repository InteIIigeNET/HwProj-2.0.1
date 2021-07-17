using System;
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
		private readonly RetryPolicy _policy;

		private readonly string _queueName;
		private readonly IServiceScopeFactory _scopeFactory;

		private IModel _consumerChannel;

		public EventBusRabbitMq(IDefaultConnection connection, IServiceProvider serviceProvider,
			IServiceScopeFactory scopeFactory, RetryPolicy policy)
		{
			_connection = connection;
			_scopeFactory = scopeFactory;
			_queueName = serviceProvider.GetApplicationUniqueIdentifier().Split('\\').Last();
			_policy = policy;
			_consumerChannel = CreateConsumerChannel();
		}

		public void Dispose()
		{
			_consumerChannel.Close();
			_connection.Dispose();
		}

		public void Publish(Event @event)
		{
			using (var channel = _connection.CreateModel())
			{
				channel.ExchangeDeclare(BrokerName, ExchangeType.Direct, true);

				var message = JsonConvert.SerializeObject(@event);
				var body = Encoding.UTF8.GetBytes(message);
				var eventName = @event.GetType().Name;

				var properties = channel.CreateBasicProperties();
				properties.Persistent = true;

				_policy.Execute(() =>
				{
					channel.BasicPublish(BrokerName,
						eventName,
						true,
						properties,
						body);
				});
			}
		}

		public void Subscribe<TEvent>()
			where TEvent : Event
		{
			using (var channel = _connection.CreateModel())
			{
				var eventName = GetEventName<TEvent>();
				channel.QueueBind(_queueName, BrokerName, eventName);
			}

			StartBasicConsume();
		}

		private IModel CreateConsumerChannel()
		{
			var channel = _connection.CreateModel();

			channel.ExchangeDeclare(BrokerName, ExchangeType.Direct, true);
			channel.QueueDeclare(_queueName,
				true,
				false,
				false,
				null);

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
			_consumerChannel.BasicConsume(_queueName, false, consumer);
		}

		private async void Consumer_Received(object sender, BasicDeliverEventArgs eventArgs)
		{
			var eventName = eventArgs.RoutingKey;
			var message = Encoding.UTF8.GetString(eventArgs.Body);

			await ProcessEvent(eventName, message).ConfigureAwait(false);

			_consumerChannel.BasicAck(eventArgs.DeliveryTag, false);
		}

		private async Task ProcessEvent(string eventName, string message)
		{
			var types = AppDomain.CurrentDomain.GetAssemblies().SelectMany(x => x.GetTypes()).ToList();
			var eventType = types.FirstOrDefault(x => x.Name == eventName);
			if (eventType != null)
			{
				var @event = JsonConvert.DeserializeObject(message, eventType) as Event;
				var fullTypeInterface = typeof(IEventHandler<>).MakeGenericType(eventType);
				var handlers =
					types.Where(x => fullTypeInterface.IsAssignableFrom(x) && !x.IsInterface && !x.IsAbstract);

				using (var scope = _scopeFactory.CreateScope())
				{
					foreach (var handler in handlers)
					{
						var handlerObject = scope.ServiceProvider.GetRequiredService(handler);
						// ReSharper disable once PossibleNullReferenceException
						await ((Task) handler.GetMethod("HandleAsync")
								?.Invoke(handlerObject, new object[] {@event}))
							.ConfigureAwait(false);
					}
				}
			}
			else
			{
				await Task.CompletedTask;
			}
		}

		private static string GetEventName<TEvent>()
		{
			return typeof(TEvent).Name;
		}
	}
}