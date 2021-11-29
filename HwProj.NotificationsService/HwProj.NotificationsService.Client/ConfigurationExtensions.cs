using Microsoft.Extensions.DependencyInjection;

namespace HwProj.NotificationsService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddNotificationsServiceClient(this IServiceCollection services)
        {
            services.AddScoped<INotificationsServiceClient, NotificationsServiceClient>();
            return services;
        }
    }
}
