using System.Threading.Tasks;
using HwProj.EventBus;

namespace HwProj.EventBus.Tests
{
    public class TestHandler : IIntegrationEventHandler<IntegrationEvent>
    { 
        public bool IsHandled { get; set; }

        public TestHandler()
        {
            IsHandled = false;
        }

        public Task Handle(IntegrationEvent @event)
        {
            IsHandled = true;

            return Task.CompletedTask;
        }
    }
}
