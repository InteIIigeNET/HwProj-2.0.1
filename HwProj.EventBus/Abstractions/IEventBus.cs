namespace HwProj.EventBus.Abstractions
{
    public interface IEventBus
    {
        void Publish(Event.Event @event);

        void Subscribe<TEvent, THandler>()
            where TEvent : Event.Event
            where THandler : IEventHandler<TEvent>;
    }
}
