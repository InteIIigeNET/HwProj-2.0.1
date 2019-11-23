using System.Threading.Tasks;

namespace HwProj.EventBus
{
    public interface IEventHandler<in TEvent> 
        where TEvent : Event
    {
        Task HandleAsync(TEvent @event);
    }
}
