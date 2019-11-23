using System;
using System.Collections.Generic;
using System.Linq;

namespace HwProj.EventBus
{
    public class SubscriptionsManager : ISubscriptionsManager
    {
        private readonly Dictionary<string, List<Type>> _subscriptions;
        private readonly List<Type> _eventTypes;

        public SubscriptionsManager()
        {
            _subscriptions = new Dictionary<string, List<Type>>();
            _eventTypes = new List<Type>();
        }

        public void AddSubscription<TEvent, THandler>()
            where TEvent : Event
            where THandler : IEventHandler<TEvent>
        {
            var eventName = GetEventName<TEvent>();
            var handlerType = typeof(THandler);

            if (!_subscriptions.TryGetValue(eventName, out var handlers))
            {
                _subscriptions.Add(eventName, new List<Type>());
                _eventTypes.Add(typeof(TEvent));
                handlers = _subscriptions[eventName];
            }

            if (!handlers.Contains(handlerType))
            {
                handlers.Add(handlerType);
            }
        }

        public List<Type> GetHandlersForEvent(string eventName) =>
            _subscriptions.TryGetValue(eventName, out var handlers) ? handlers : new List<Type>();

        public Type GetEventTypeByName(string eventName)
        {
            return _eventTypes.FirstOrDefault(e => e.Name == eventName);
        }

        public string GetEventName<TEvent>() where TEvent : Event
        {
            return typeof(TEvent).Name;
        }
    }
}
