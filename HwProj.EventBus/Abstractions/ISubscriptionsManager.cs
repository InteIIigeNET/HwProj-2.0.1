using System;
using System.Collections.Generic;

namespace HwProj.EventBus
{
    public interface ISubscriptionsManager
    {
        void AddSubscription<TEvent, THandler>()
            where TEvent : Event
            where THandler : IEventHandler<TEvent>;

        List<Type> GetHandlersForEvent(string eventName);

        Type GetEventTypeByName(string eventName);

        string GetEventName<TEvent>() where TEvent : Event;
    }
}
