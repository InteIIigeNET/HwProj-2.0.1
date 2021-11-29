using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace HwProj.CoursesService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddCoursesServiceClient(this IServiceCollection services)
        {
            services.AddScoped<ICoursesServiceClient, CoursesServiceClient>();
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            return services;
        }
    }
}