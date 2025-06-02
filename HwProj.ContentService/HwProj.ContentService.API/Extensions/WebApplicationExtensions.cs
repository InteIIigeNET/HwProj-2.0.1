using Amazon.S3;
using Amazon.S3.Util;
using HwProj.ContentService.API.Configuration;
using HwProj.ContentService.API.Models.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HwProj.ContentService.API.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication ConfigureWebApp(this WebApplication application)
    {
        if (application.Environment.IsDevelopment())
        {
            application.UseDeveloperExceptionPage()
                .UseSwagger()
                .UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "Content API"); });
        }
        else
        {
            application.UseHsts();
        }

        application.UseAuthentication();
        application.UseCors(x => x
            .AllowAnyMethod()
            .AllowAnyHeader()
            .SetIsOriginAllowed(origin => true)
            .AllowCredentials());

        application.UseRouting();
        application.MapControllers();
        application.MigrateDatabase();

        return application;
    }
    
    public static async Task CreateBucketIfNotExists(this WebApplication application)
    {
        using var scope = application.Services.CreateScope();
        var amazonS3Client = scope.ServiceProvider.GetService<IAmazonS3>();
        var defaultBucketName = scope.ServiceProvider.GetRequiredService<IOptions<ExternalStorageConfiguration>>()
            .Value
            .DefaultBucketName;
        if (amazonS3Client == null || defaultBucketName == null)
        {
            throw new ApplicationException("Конфигурация клиента AWS S3 не задана");
        }

        try
        {
            if (!await AmazonS3Util.DoesS3BucketExistV2Async(amazonS3Client, defaultBucketName))
                await amazonS3Client.PutBucketAsync(defaultBucketName);
            application.Logger.LogInformation("Сервис успешно запущен. Установлено соединение с YandexObjectStorage");
        }
        catch (AmazonS3Exception)
        {
            application.Logger.LogWarning("Не удалось установить соединение с Yandex Object Storage. " +
                                          "Проверьте значения секции StorageClientConfiguration и перезапустите сервис");
        }
    }
    
    private static void MigrateDatabase(this WebApplication application)
    {
        using var scope = application.Services.CreateScope();
        var contentContext = scope.ServiceProvider.GetRequiredService<ContentContext>();
            
        if (application.Environment.IsDevelopment())
        {
            contentContext.Database.Migrate();
            return;
        }

        var logger = application.Services
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger(typeof(WebApplicationExtensions));

        var tries = 0;
        const int maxTries = 100;

        while (!contentContext.Database.CanConnect() && ++tries <= maxTries)
        {
            logger.LogWarning($"Can't connect to database. Try {tries}.");
            Thread.Sleep(5000);
        }

        if (tries > maxTries) throw new Exception("Can't connect to database");
        contentContext.Database.Migrate();
    }
}