using System.Threading.Tasks;
using HwProj.EventBus.Client;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.EventBus.Tests
{
    public class TestHandler : EventHandlerBase<TestEvent>
    {
        public bool IsHandled { get; set; }

        public TestHandler()
        {
            IsHandled = false;
        }

        public override Task HandleAsync(TestEvent @event)
        {
            throw new System.NotImplementedException();
        }
    }
}
