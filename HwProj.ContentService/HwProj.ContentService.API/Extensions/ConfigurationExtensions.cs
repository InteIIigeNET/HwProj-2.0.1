using System.Threading.Channels;
using Amazon;
using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using Amazon.S3;
using HwProj.ContentService.API.Configuration;
using HwProj.ContentService.API.Models.Database;
using HwProj.ContentService.API.Models.Messages;
using HwProj.ContentService.API.Repositories;
using HwProj.ContentService.API.Services;
using HwProj.ContentService.API.Services.Interfaces;
using HwProj.Utils.Auth;
using HwProj.Utils.Configuration;
using HwProj.Utils.Configuration.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
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

        // Подготавливаем инфраструктуру БД
        var connectionString = ConnectionString.GetConnectionString(configuration);
        services.AddDbContext<ContentContext>(options => options.UseSqlServer(connectionString));
        services.AddScoped<IFileRecordRepository, FileRecordRepository>();
        
        services.ConfigureStorageClient(clientConfigurationSection);
        services.ConfigureChannelInfrastructure<IProcessFileMessage>();
        
        services.AddScoped<IFileKeyService, FileKeyService>();
        services.AddScoped<IS3FilesService, S3FilesService>();
        services.AddScoped<IFilesInfoService, FilesInfoService>();
        
        services.AddHttpClient();

        services.ConfigureHwProjContentService();
        return services;
    }

    private static void ConfigureChannelInfrastructure<T>(this IServiceCollection services)
    {
        services.AddSingleton<Channel<T>>(_ =>
            Channel.CreateUnbounded<T>(
                new UnboundedChannelOptions
            {
                SingleWriter = false,
                SingleReader = true // Один читатель, последовательно работающий с БД
            }));

        services.AddSingleton<ChannelWriter<T>>(serviceProvider => 
            serviceProvider.GetRequiredService<Channel<T>>().Writer);
        services.AddSingleton<ChannelReader<T>>(serviceProvider => 
            serviceProvider.GetRequiredService<Channel<T>>().Reader);

        services.AddScoped<IMessageProducer, MessageProducer>();
        services.AddHostedService<MessageConsumer>();
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