using System;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.SolutionsService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddSolutionServiceClient(this IServiceCollection services, HttpClient httpClient,
            string baseUri)
        {
            var solutionServiceClient = new SolutionsServiceClient(httpClient, new Uri(baseUri));
            services.AddSingleton<ISolutionsServiceClient>(solutionServiceClient);
            return services;
        }
    }
}
