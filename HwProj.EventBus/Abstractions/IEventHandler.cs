using System.Threading.Tasks;

namespace HwProj.EventBus.Abstractions
{
    public interface IEventHandler<in TEvent> 
        where TEvent : Event.Event
    {
        Task HandleAsync(TEvent @event);
    }
}
