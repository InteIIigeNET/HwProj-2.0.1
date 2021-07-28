using System;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.CoursesService.Client
{
    public static class ConfigurationExtensions
    {
        public static IServiceCollection AddCoursesServiceClient(this IServiceCollection services, HttpClient httpClient,
            string baseUri)
        {
            var coursesServiceClient = new CoursesServiceClient(httpClient, new Uri(baseUri));
            services.AddSingleton<ICoursesServiceClient>(coursesServiceClient);
            return services;
        }
    }
}