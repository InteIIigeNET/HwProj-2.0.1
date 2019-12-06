using HwProj.EventBus.Client;

namespace HwProj.EventBus.Tests
{
    public class TestEvent : Event
    {
        public int OldPrice { get; set; }

        public int NewPrice { get; set; }

        public TestEvent(int newPrice, int oldPrice) 
        {
            OldPrice = oldPrice;
            NewPrice = newPrice;
        }
    }
}
