using System.Threading.Tasks;
using HwProj.EventBus.Events;

namespace HwProj.EventBus
{
    public interface IIntegrationEventHandler<in TIntegrationEvent> 
        where TIntegrationEvent: IntegrationEvent
    {
        Task Handle(TIntegrationEvent @event);
    }
}