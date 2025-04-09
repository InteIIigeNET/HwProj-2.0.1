using Microsoft.Extensions.DependencyInjection;

namespace HwProj.ContentService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddContentServiceClient(this IServiceCollection services)
        {
            services.AddScoped<IContentServiceClient, ContentServiceClient>();
            return services;
        }
    }
}
