using System;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.AuthService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddAuthServiceClient(this IServiceCollection services, HttpClient httpClient,
            string baseUri)
        {
            var authServiceClient = new AuthServiceClient(httpClient, new Uri(baseUri));
            services.AddSingleton<IAuthServiceClient>(authServiceClient);
            return services;
        }
    }
}
