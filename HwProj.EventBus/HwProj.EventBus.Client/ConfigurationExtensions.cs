using System;
using System.Linq;
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
        public static IServiceCollection AddEventBus(this IServiceCollection services, IConfiguration configuration)
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
                VirtualHost = eventBusSection["EventBusVirtualHost"]
            });

            services.AddSingleton<IDefaultConnection, DefaultConnection>();
            services.AddSingleton<IEventBus, EventBusRabbitMq>();

            var types = AppDomain.CurrentDomain.GetAssemblies().SelectMany(x => x.GetTypes()).ToList();
            var eventTypes = types.Where(x => typeof(Event).IsAssignableFrom(x));
            foreach (var eventType in eventTypes)
            {
                var fullTypeInterface = typeof(IEventHandler<>).MakeGenericType(eventType);
                var handlersTypes = types.Where(x =>
                    fullTypeInterface.IsAssignableFrom(x) && !x.IsInterface && !x.IsAbstract);

                foreach (var handlerType in handlersTypes)
                {
                    services.AddTransient(handlerType);
                }
            }

            return services;
        }

    }
}
