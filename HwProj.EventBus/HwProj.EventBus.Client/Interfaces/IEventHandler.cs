using System.Threading.Tasks;

namespace HwProj.EventBus.Client.Interfaces
{
    public interface IEventHandler<in TEvent> 
        where TEvent : Event
    {
        Task HandleAsync(TEvent @event);
    }
}
