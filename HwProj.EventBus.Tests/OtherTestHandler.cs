using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace HwProj.EventBus.Tests
{
    public class OtherTestHandler : IIntegrationEventHandler<TestEvent>
    {
        public int NewPrice { get; set; }
        public int OldPrice { get; set; }

        public int ChangedSum => Math.Abs(NewPrice - OldPrice);

        public OtherTestHandler()
        {
            NewPrice = 0;
            OldPrice = 0;
        }

        public Task Handle(TestEvent @event)
        {
            NewPrice = @event.NewPrice;
            OldPrice = @event.OldPrice;

            return Task.CompletedTask;
        }
    }
}
