using System;
using System.Collections.Generic;
using System.Linq;

namespace HwProj.EventBus
{
    public class SubscriptionsManager
    {
        private readonly Dictionary<string, List<Type>> _handlers;
        private readonly List<Type> _eventTypes;

        public SubscriptionsManager()
        {
            _handlers = new Dictionary<string, List<Type>>();
            _eventTypes = new List<Type>();
        }

        public void AddSubscription<TEvent, THandler>()
        {
            var eventName = typeof(TEvent).Name;
            var handlerType = typeof(THandler);

            if (!_handlers.ContainsKey(eventName))
            {
                _handlers.Add(eventName, new List<Type>());
                _eventTypes.Add(typeof(TEvent));
            }

            if (!_handlers[eventName].Any(h => h == handlerType))
            {
                _handlers[eventName].Add(handlerType);
            }
        }

        public List<Type> GetHandlersForEvent(string eventName) => _handlers[eventName];

        public bool HasSubscriptionForEvent(string eventName) => _handlers.ContainsKey(eventName);

        public Type GetEventTypeByName(string eventName)
        {
            return _eventTypes.SingleOrDefault(e => e.Name == eventName);
        }
    }
}
