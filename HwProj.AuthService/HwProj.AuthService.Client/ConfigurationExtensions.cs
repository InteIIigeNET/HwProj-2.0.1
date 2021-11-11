using System;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.AuthService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddAuthServiceClient(this IServiceCollection services)
        {
            services.AddScoped<IAuthServiceClient, AuthServiceClient>();
            return services;
        }
    }
}
