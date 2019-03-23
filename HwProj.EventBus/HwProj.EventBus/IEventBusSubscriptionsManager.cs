using System;
using System.Collections.Generic;
using HwProj.EventBus.Events;

namespace HwProj.EventBus
{
    public interface IEventBusSubscriptionsManager
    {
        bool IsEmpty { get; }
        event EventHandler<string> OnEventRemoved;

        void AddSubscription<T, TH>()
            where T : IntegrationEvent
            where TH : IIntegrationEventHandler<T>;

        void RemoveSubscription<T, TH>()
            where TH : IIntegrationEventHandler<T>
            where T : IntegrationEvent;

        bool HasSubscriptionsForEvent<T>() where T : IntegrationEvent;
        bool HasSubscriptionsForEvent(string eventName);
        Type GetEventTypeByName(string eventName);
        void Clear();
        IEnumerable<Type> GetHandlersForEvent<T>() where T : IntegrationEvent;
        IEnumerable<Type> GetHandlersForEvent(string eventName);
        string GetEventKey<T>();
    }
}