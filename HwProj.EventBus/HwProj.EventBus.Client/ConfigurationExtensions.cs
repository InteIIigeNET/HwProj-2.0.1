using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Reflection;
using HwProj.EventBus.Client.Implementations;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
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
                VirtualHost = eventBusSection["EventBusVirtualHost"],
                AutomaticRecoveryEnabled = true,
                DispatchConsumersAsync = true
            });

            services.AddSingleton<IDefaultConnection, DefaultConnection>();
            services.AddSingleton<IEventBus, EventBusRabbitMq>();

            var handlerTypes = AppDomain.CurrentDomain.GetAssemblies()
                .SelectMany(GetLoadableTypes)
                .Where(x => typeof(IEventHandler<Event>).IsAssignableFrom(x) && !x.IsInterface && !x.IsAbstract);

            foreach (var handlerType in handlerTypes)
            {
                services.TryAddTransient(handlerType);
            }

            return services;
        }

        private static IEnumerable<Type> GetLoadableTypes(Assembly assembly)
        {
            try
            {
                return assembly.GetTypes();
            }
            catch (ReflectionTypeLoadException e)
            {
                return e.Types.Where(x => x != null);
            }
        }
    }
}
