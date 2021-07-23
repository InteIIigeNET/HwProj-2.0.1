using System;
using System.Net.Http;
using HwProj.NotificationsService.Client;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.AuthService.Client
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
