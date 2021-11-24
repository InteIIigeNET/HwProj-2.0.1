using System;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.TelegramBotService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddTelegramBotClient(this IServiceCollection services, HttpClient httpClient,
            string baseUri)
        {
            var telegramBotServiceClient = new TelegramBotServiceClient(httpClient, new Uri(baseUri));
            services.AddSingleton<ITelegramBotServiceClient>(telegramBotServiceClient);
            return services;
        }
    }
}