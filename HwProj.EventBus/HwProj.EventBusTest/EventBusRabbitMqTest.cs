using System;
using System.Threading;
using System.Threading.Tasks;
using HwProj.EventBus;
using HwProj.EventBus.Events;
using HwProj.EventBusRabbitMQ;
using Moq;
using NUnit.Framework;
using RabbitMQ.Client;

namespace HwProj.EventBusTest
{
    public class EventBusRabbitMqTest
    {

        private const string Hostname = "localhost";
        
        [Test]
        public void ShouldMessagePrintInConsole()
        {
            //arrange

            var handler = new TestHandler();
            
            var serviceProvider = new Mock<IServiceProvider>();
            serviceProvider
                .Setup(x => x.GetService(typeof(TestHandler)))
                .Returns(handler);

            var connectionFactory = new ConnectionFactory() {HostName = Hostname};

            var eventBus = new EventBusRabbitMq(
                new DefaultRabbitMQPersistentConnection(connectionFactory),
                new InMemoryEventBusSubscriptionsManager(), 
                serviceProvider.Object,
                queueName: "test");            
            
            //act
            
            eventBus.Subscribe<IntegrationEvent, TestHandler>();
            eventBus.Publish(new IntegrationEvent());

            //assert

            Thread.Sleep(1000);
            
            Assert.True(handler.IsHandled);
        }
    }
}