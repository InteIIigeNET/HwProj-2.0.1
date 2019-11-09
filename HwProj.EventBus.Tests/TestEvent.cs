using System;
using System.Collections.Generic;
using System.Text;

namespace HwProj.EventBus.Tests
{
    public class TestEvent : IntegrationEvent
    {
        public int OldPrice { get; set; }

        public int NewPrice { get; set; }

        public TestEvent(int newPrice, int oldPrice) : base()
        {
            OldPrice = oldPrice;
            NewPrice = newPrice;
        }
    }
}
