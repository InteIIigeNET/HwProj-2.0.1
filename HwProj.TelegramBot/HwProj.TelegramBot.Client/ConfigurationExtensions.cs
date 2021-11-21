using System;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.TelegramBot.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddTelegramBotClient(this IServiceCollection services, HttpClient httpClient,
            string baseUri)
        {
            var solutionServiceClient = new TelegramBotClient(httpClient, new Uri(baseUri));
            services.AddSingleton<ITelegramBotClient>(solutionServiceClient);
            return services;
        }
    }
}