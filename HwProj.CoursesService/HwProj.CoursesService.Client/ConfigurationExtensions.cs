using Microsoft.Extensions.DependencyInjection;

namespace HwProj.CoursesService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddCoursesServiceClient(this IServiceCollection services)
        {
            services.AddScoped<ICoursesServiceClient, CoursesServiceClient>();
            return services;
        }
    }
}