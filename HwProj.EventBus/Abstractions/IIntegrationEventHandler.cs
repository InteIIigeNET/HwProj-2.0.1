using System.Threading.Tasks;

namespace HwProj.EventBus
{
    public interface IIntegrationEventHandler<in TEvent> 
        where TEvent : IntegrationEvent
    {
        Task Handle(TEvent @event);
    }
}
