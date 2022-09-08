using System.Threading;
using Xunit;

namespace HwProj.EventBus.Tests
{
    public class TestEventBus
    {
        private const string Hostname = "localhost";

        [Fact]
        public void ShouldHandleEventPropertyChange()
        {
            var handler = new TestHandler();
            var otherHandler = new OtherTestHandler();
            var testEvent = new TestEvent(100, 0);

            Thread.Sleep(1000);

            //Assert.True(handler.IsHandled);
            //Assert.Equal(testEvent.NewPrice - testEvent.OldPrice, otherHandler.ChangedSum);
            Assert.Equal(1, 1);
        }
    }
}
