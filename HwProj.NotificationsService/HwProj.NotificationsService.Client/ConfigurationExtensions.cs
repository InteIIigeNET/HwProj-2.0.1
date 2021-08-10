using System;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.NotificationsService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddNotificationsServiceClient(this IServiceCollection services, HttpClient httpClient,
            string baseUri)
        {
            var notificationsServiceClient = new NotificationsServiceClient(httpClient, new Uri(baseUri));
            services.AddSingleton<INotificationsServiceClient>(notificationsServiceClient);
            return services;
        }
    }
}
