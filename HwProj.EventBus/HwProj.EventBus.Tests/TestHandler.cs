using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.EventBus.Tests
{
    public class TestHandler : IEventHandler<TestEvent>
    {
        public bool IsHandled { get; set; }

        public TestHandler()
        {
            IsHandled = false;
        }

        public Task HandleAsync(TestEvent @event)
        {
            throw new System.NotImplementedException();
        }
    }
}
