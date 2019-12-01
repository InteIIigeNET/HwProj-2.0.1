using Moq;
using Polly;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System;
using System.Net.Sockets;
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

            var serviceProvider = new Mock<IServiceProvider>();
            serviceProvider.Setup(x => x.GetService(typeof(TestHandler))).Returns(handler);
            serviceProvider.Setup(x => x.GetService(typeof(OtherTestHandler))).Returns(otherHandler);

            var retryCount = 5;
            var policy = Policy.Handle<SocketException>()
                       .Or<BrokerUnreachableException>()
                       .WaitAndRetry(retryCount, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

            var factory = new ConnectionFactory { HostName = Hostname };

            var eventBus = new EventBusRabbitMq(new DefaultConnection(policy, factory),
                                                //new SubscriptionsManager(),
                                                serviceProvider.Object,
                                                policy);

            eventBus.Subscribe<Event.Event>();
            eventBus.Subscribe<TestEvent>();
            eventBus.Publish(new Event.Event());
            eventBus.Publish(testEvent);

            Thread.Sleep(1000);

            Assert.True(handler.IsHandled);
            Assert.Equal(testEvent.NewPrice - testEvent.OldPrice, otherHandler.ChangedSum);
        }
    }
}
