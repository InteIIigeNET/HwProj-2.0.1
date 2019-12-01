using System.Threading.Tasks;
using HwProj.EventBus.Abstractions;

namespace HwProj.EventBus.Tests
{
    public class TestHandler : IEventHandler<Event.Event>
    { 
        public bool IsHandled { get; set; }

        public TestHandler()
        {
            IsHandled = false;
        }

        public Task HandleAsync(Event.Event @event)
        {
            IsHandled = true;

            return Task.CompletedTask;
        }
    }
}
