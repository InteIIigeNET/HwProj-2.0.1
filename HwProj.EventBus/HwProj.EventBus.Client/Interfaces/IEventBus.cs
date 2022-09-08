using System;

namespace HwProj.EventBus.Client.Interfaces
{
    public interface IEventBus
    {
        void Publish(Event @event);

        IEventBusSubscriber CreateSubscriber();
    }

    public interface IEventBusSubscriber : IDisposable
    {
        void Subscribe<TEvent, THandler>()
            where TEvent : Event
            where THandler : EventHandlerBase<TEvent>;
    }
}
