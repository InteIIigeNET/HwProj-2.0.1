using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace HwProj.EventBus.Client.Implementations
{
    /// <summary>
    /// Подписки сервиса: имя события (routing key) -> типизированный набор обработчиков.
    /// Заполняется при конфигурации DI и дальше только читается.
    /// </summary>
    internal class EventSubscriptions
    {
        private readonly Dictionary<string, EventSubscription> _subscriptions =
            new Dictionary<string, EventSubscription>();

        public bool IsEmpty => _subscriptions.Count == 0;

        public IEnumerable<string> EventNames => _subscriptions.Keys;

        public void Add<TEvent, THandler>()
            where TEvent : Event
            where THandler : class, IEventHandler<TEvent>
        {
            var eventName = typeof(TEvent).Name;
            if (!_subscriptions.TryGetValue(eventName, out var subscription))
            {
                subscription = new EventSubscription<TEvent>();
                _subscriptions.Add(eventName, subscription);
            }

            if (!(subscription is EventSubscription<TEvent> typedSubscription))
                throw new InvalidOperationException(
                    $"Событие {eventName} уже зарегистрировано для типа {subscription.EventType.FullName}, " +
                    $"а {typeof(TEvent).FullName} имеет то же имя");

            typedSubscription.AddHandler<THandler>();
        }

        public bool TryGet(string eventName, out EventSubscription subscription) =>
            _subscriptions.TryGetValue(eventName, out subscription);
    }

    internal abstract class EventSubscription
    {
        public abstract Type EventType { get; }

        public abstract Task HandleAsync(string message, IServiceScopeFactory scopeFactory, ILogger logger);
    }

    internal class EventSubscription<TEvent> : EventSubscription where TEvent : Event
    {
        private readonly List<(Type Type, Func<IServiceProvider, IEventHandler<TEvent>> Resolve)> _handlers =
            new List<(Type, Func<IServiceProvider, IEventHandler<TEvent>>)>();

        public override Type EventType => typeof(TEvent);

        public void AddHandler<THandler>() where THandler : class, IEventHandler<TEvent>
        {
            if (_handlers.Any(x => x.Type == typeof(THandler))) return;
            _handlers.Add((typeof(THandler), sp => sp.GetRequiredService<THandler>()));
        }

        public override async Task HandleAsync(string message, IServiceScopeFactory scopeFactory, ILogger logger)
        {
            var @event = JsonConvert.DeserializeObject<TEvent>(message);
            if (@event == null)
            {
                logger.LogWarning("Пустое сообщение для события {EventName}", typeof(TEvent).Name);
                return;
            }

            foreach (var (handlerType, resolve) in _handlers)
            {
                // Своя область на каждый обработчик: упавший обработчик не оставит
                // общий DbContext в некорректном состоянии для следующих
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    await resolve(scope.ServiceProvider).HandleAsync(@event);
                }
                catch (Exception e)
                {
                    logger.LogError(e, "Обработчик {Handler} упал при обработке события {EventName} ({EventId})",
                        handlerType.Name, typeof(TEvent).Name, @event.Id);
                }
            }
        }
    }
}
