using HwProj.EventBus;
using Moq;
using RabbitMQ.Client;
using System;
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
            //arrange

            var handler = new TestHandler();
            var otherHandler = new OtherTestHandler();
            var testEvent = new TestEvent(100, 0);

            var serviceProvider = new Mock<IServiceProvider>();
            serviceProvider.Setup(x => x.GetService(typeof(TestHandler))).Returns(handler);
            serviceProvider.Setup(x => x.GetService(typeof(OtherTestHandler))).Returns(otherHandler);

            var eventBus = new EventBusRabbitMQ(new DefaultConnection(Hostname),
                                                new SubscriptionsManager(),
                                                serviceProvider.Object,
                                                queueName: "test");

            //act

            eventBus.Subscribe<IntegrationEvent, TestHandler>();
            eventBus.Subscribe<TestEvent, OtherTestHandler>();
            eventBus.Publish(new IntegrationEvent());
            eventBus.Publish(testEvent);

            //assert

            Thread.Sleep(1000);

            Assert.True(handler.IsHandled);
            Assert.Equal(testEvent.NewPrice - testEvent.OldPrice, otherHandler.ChangedSum);
        }
    }
}
