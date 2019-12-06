namespace HwProj.EventBus.Client.Interfaces
{
    public interface IEventBus
    {
        void Publish(Event @event);

        void Subscribe<TEvent>()
            where TEvent : Event;
    }
}
