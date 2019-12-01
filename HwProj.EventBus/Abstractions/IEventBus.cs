namespace HwProj.EventBus.Abstractions
{
    public interface IEventBus
    {
        void Publish(Event.Event @event);

        void Subscribe<TEvent>()
            where TEvent : Event.Event;
    }
}
