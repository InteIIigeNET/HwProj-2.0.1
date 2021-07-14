using System.Threading.Tasks;

namespace HwProj.EventBus.Client.Interfaces
{
    public interface IEventHandler<in TEvent>
    {
        Task HandleAsync(TEvent @event);
    }
}
