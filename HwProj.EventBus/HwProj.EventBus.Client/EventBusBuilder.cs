using HwProj.EventBus.Client.Implementations;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace HwProj.EventBus.Client
{
    public class EventBusBuilder
    {
        private readonly IServiceCollection _services;
        private readonly EventSubscriptions _subscriptions;

        internal EventBusBuilder(IServiceCollection services, EventSubscriptions subscriptions)
        {
            _services = services;
            _subscriptions = subscriptions;
        }

        /// <summary>
        /// Регистрирует обработчик в DI и подписывает очередь сервиса на событие
        /// </summary>
        public EventBusBuilder AddHandler<TEvent, THandler>()
            where TEvent : Event
            where THandler : class, IEventHandler<TEvent>
        {
            _services.TryAddTransient<THandler>();
            _subscriptions.Add<TEvent, THandler>();
            return this;
        }
    }
}
