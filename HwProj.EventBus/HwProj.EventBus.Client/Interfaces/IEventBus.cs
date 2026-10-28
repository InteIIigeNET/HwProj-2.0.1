namespace HwProj.EventBus.Client.Interfaces
{
    public interface IEventBus
    {
        void Publish(Event @event);
    }
}
