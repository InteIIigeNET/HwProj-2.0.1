using HwProj.EventBus.Client.Interfaces;

namespace HwProj.EventBus.Client.Implementations
{
    public class EventBusSubscriber : IEventBusSubscriber
    {
        private readonly EventBusRabbitMq _eventBusRabbitMq;

        public EventBusSubscriber(EventBusRabbitMq eventBusRabbitMq)
        {
            _eventBusRabbitMq = eventBusRabbitMq;
        }

        public void Dispose()
        {
            _eventBusRabbitMq.StartBasicConsume();
        }

        public void Subscribe<TEvent, THandler>()
            where TEvent : Event
            where THandler : EventHandlerBase<TEvent> => _eventBusRabbitMq.Subscribe<TEvent, THandler>();
    }
}
