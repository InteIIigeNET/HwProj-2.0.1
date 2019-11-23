namespace HwProj.EventBus.Tests
{
    public class TestEvent : Event
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
