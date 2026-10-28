using System;
using System.Net.Sockets;
using HwProj.EventBus.Client.Implementations;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;

namespace HwProj.EventBus.Client
{
    public static class ConfigurationExtensions
    {
        /// <param name="configureHandlers">
        /// Подписки сервиса на события. Если не задано, сервис только публикует события
        /// и не создаёт свою очередь.
        /// </param>
        public static IServiceCollection AddEventBus(this IServiceCollection services, IConfiguration configuration,
            Action<EventBusBuilder>? configureHandlers = null)
        {
            var eventBusSection = configuration.GetSection("EventBus");

            var retryCount = 5;
            if (!string.IsNullOrEmpty(eventBusSection["EventBusRetryCount"]))
            {
                retryCount = int.Parse(eventBusSection["EventBusRetryCount"]);
            }

            services.AddSingleton(sp => Policy.Handle<SocketException>()
                .Or<BrokerUnreachableException>()
                .WaitAndRetry(retryCount, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))));

            services.AddSingleton<IConnectionFactory, ConnectionFactory>(sp => new ConnectionFactory
            {
                HostName = eventBusSection["EventBusHostName"],
                UserName = eventBusSection["EventBusUserName"],
                Password = eventBusSection["EventBusPassword"],
                VirtualHost = eventBusSection["EventBusVirtualHost"],
                AutomaticRecoveryEnabled = true,
                DispatchConsumersAsync = true
            });

            services.AddSingleton<IDefaultConnection, DefaultConnection>();
            services.AddSingleton<IEventBus, EventBusRabbitMq>();

            var subscriptions = new EventSubscriptions();
            configureHandlers?.Invoke(new EventBusBuilder(services, subscriptions));

            if (!subscriptions.IsEmpty)
            {
                services.AddSingleton(subscriptions);
                services.AddHostedService<EventBusConsumer>();
            }

            return services;
        }
    }
}
