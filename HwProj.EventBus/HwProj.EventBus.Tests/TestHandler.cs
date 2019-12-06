using System.Threading.Tasks;
using HwProj.EventBus.Client;
using HwProj.EventBus.Client.Interfaces;

namespace HwProj.EventBus.Tests
{
    public class TestHandler : IEventHandler<Event>
    { 
        public bool IsHandled { get; set; }

        public TestHandler()
        {
            IsHandled = false;
        }

        public Task HandleAsync(Event @event)
        {
            IsHandled = true;

            return Task.CompletedTask;
        }
    }
}
