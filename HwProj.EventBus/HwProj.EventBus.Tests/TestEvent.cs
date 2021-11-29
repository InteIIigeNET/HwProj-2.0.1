using HwProj.EventBus.Client;

namespace HwProj.EventBus.Tests
{
    public class TestEvent : Event
    {
        public TestEvent(int newPrice, int oldPrice)
        {
            OldPrice = oldPrice;
            NewPrice = newPrice;
        }

        public int OldPrice { get; set; }

        public int NewPrice { get; set; }
    }
}
