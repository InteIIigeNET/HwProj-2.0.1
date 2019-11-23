namespace HwProj.EventBus
{
    public interface IEventBus
    {
        void Publish(Event @event);

        void Subscribe<TEvent, THandler>()
            where TEvent : Event
            where THandler : IEventHandler<TEvent>;
    }
}
