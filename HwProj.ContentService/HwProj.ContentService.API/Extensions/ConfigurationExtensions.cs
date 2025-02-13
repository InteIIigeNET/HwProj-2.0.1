using Amazon;
using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using Amazon.S3;
using HwProj.ContentService.API.Configuration;
using HwProj.ContentService.API.Services;
using HwProj.Utils.Configuration;
using HwProj.Utils.Configuration.Middleware;
using Newtonsoft.Json;

namespace HwProj.ContentService.API.Extensions;

public static class ConfigurationExtensions
{
    public static IServiceCollection ConfigureWithAWS(this IServiceCollection services,
        IConfigurationRoot configuration)
    {
        var clientConfigurationSection = configuration.GetSection("StorageClientConfiguration");
        services.Configure<StorageClientConfiguration>(clientConfigurationSection);

        services.ConfigureStorageClient(clientConfigurationSection);
        services.AddScoped<IFilesService, FilesService>();
        services.AddHttpClient();

        services.Configure<ServiceConfiguration>(configuration);
        services.ConfigureHwProjService(configuration);
        
        return services;
    }

    private static void ConfigureStorageClient(this IServiceCollection services, IConfigurationSection configuration)
    {
        var clientConfiguration = configuration.Get<StorageClientConfiguration>();
        if (clientConfiguration == null)
            throw new NullReferenceException("Ошибка при чтении конфигурации StorageClientConfiguration");

        var awsOptions = new AWSOptions
        {
            Credentials = new BasicAWSCredentials(
                clientConfiguration.AccessKeyId,
                clientConfiguration.SecretKey
            ),
            DefaultClientConfig =
            {
                ServiceURL = clientConfiguration.ServiceURL,
            },
            Region = RegionEndpoint.GetBySystemName(clientConfiguration.Region)
        };

        services.AddAWSService<IAmazonS3>(awsOptions);
    }

    // Не вызываем ConfigureHwProjServices из-за проблем с AddMvc (.NET 8 / ASP.Net Core 2.2)
    private static void ConfigureHwProjService(this IServiceCollection services, IConfiguration configuration)
    {
        var serviceName = configuration.Get<ServiceConfiguration>()?.ServiceName;
        if (serviceName == null)
            throw new NullReferenceException("Ошибка при чтении названия микросервиса из параметров конфигурации");

        services.AddControllers().AddNewtonsoftJson(options =>
        {
            options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        });
        services.ConfigureHwProjServiceSwaggerGen(serviceName);
        services.ConfigureHwProjServiceAuthentication(serviceName);

        services.AddTransient<NoApiGatewayMiddleware>();
        services.AddHttpContextAccessor();
    }
}