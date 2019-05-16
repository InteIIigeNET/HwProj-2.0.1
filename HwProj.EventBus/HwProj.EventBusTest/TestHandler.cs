using System.Threading.Tasks;
using HwProj.EventBus;
using HwProj.EventBus.Events;

namespace HwProj.EventBusTest
{
    public class TestHandler : IIntegrationEventHandler<IntegrationEvent>
    {
        public bool IsHandled { get; private set; } = false;
        
        public Task Handle(IntegrationEvent @event)
        {
            IsHandled = true;
            
            return Task.CompletedTask;
        }
    }
}