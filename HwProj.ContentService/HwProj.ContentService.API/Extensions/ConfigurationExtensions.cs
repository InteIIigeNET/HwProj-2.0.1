using Amazon;
using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using Amazon.S3;
using HwProj.ContentService.API.Configuration;
using HwProj.ContentService.API.Services;
using HwProj.Utils.Auth;
using HwProj.Utils.Configuration.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;

namespace HwProj.ContentService.API.Extensions;

public static class ConfigurationExtensions
{
    public static IServiceCollection ConfigureWithAWS(this IServiceCollection services,
        IConfigurationRoot configuration)
    {
        var clientConfigurationSection = configuration.GetSection("StorageClientConfiguration");
        services.Configure<StorageClientConfiguration>(clientConfigurationSection);
        
        // Увеличиваем допустимый размер тела запросов, содержащих multipart/form-data
        services.Configure<FormOptions>(options =>
        {
            options.MultipartBodyLengthLimit = 200 * 1024 * 1024;
        });

        services.ConfigureStorageClient(clientConfigurationSection);
        services.AddSingleton<IFileKeyService, FileKeyService>();
        services.AddScoped<IFilesService, FilesService>();
        services.AddHttpClient();

        services.ConfigureHwProjContentService();
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
    private static void ConfigureHwProjContentService(this IServiceCollection services)
    {
        services.AddControllers().AddNewtonsoftJson(options =>
        {
            options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        });
        services.ConfigureContentServiceSwaggerGen();
        services.ConfigureContentServiceAuthentication();

        services.AddTransient<NoApiGatewayMiddleware>();
        services.AddHttpContextAccessor();
    }

    private static void ConfigureContentServiceSwaggerGen(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Content API", Version = "v1" });
            c.CustomOperationIds(apiDesc =>
            {
                var controllerName = apiDesc.ActionDescriptor.RouteValues["controller"];
                var actionName = apiDesc.ActionDescriptor.RouteValues["action"];
                return $"{controllerName}{actionName}";
            });
        });
    }

    private static void ConfigureContentServiceAuthentication(this IServiceCollection services)
    {
        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false; //TODO: dev env setting
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = "AuthService",
                    ValidateIssuer = true,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    IssuerSigningKey = AuthorizationKey.SecurityKey,
                    ValidateIssuerSigningKey = true
                };
            });
    }
}