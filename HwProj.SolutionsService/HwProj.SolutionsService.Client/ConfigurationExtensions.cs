using System;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.SolutionsService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddSolutionServiceClient(this IServiceCollection services)
        {
            services.AddScoped<ISolutionsServiceClient, SolutionsServiceClient>();
            return services;
        }
    }
}
