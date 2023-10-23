using System.Threading.Tasks;

namespace HwProj.EventBus.Client.Interfaces
{
    public interface IEventHandler<in TEvent>
    {
        Task HandleAsync(TEvent @event);
    }

    public abstract class EventHandlerBase<TEvent> : IEventHandler<Event> where TEvent : Event
    {
        public Task HandleAsync(Event @event) =>
            @event as TEvent is { } x ? HandleAsync(x) : Task.CompletedTask;

        public abstract Task HandleAsync(TEvent @event);
    }
}
