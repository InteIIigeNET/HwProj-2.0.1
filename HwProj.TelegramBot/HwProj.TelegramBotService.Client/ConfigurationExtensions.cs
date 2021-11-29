using Microsoft.Extensions.DependencyInjection;

namespace HwProj.TelegramBotService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddTelegramBotClient(this IServiceCollection services)
        {
            services.AddScoped<ITelegramBotServiceClient, TelegramBotServiceClient>();
            return services;
        }
    }
}