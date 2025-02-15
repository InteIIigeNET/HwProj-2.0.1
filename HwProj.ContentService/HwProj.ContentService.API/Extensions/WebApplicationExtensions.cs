using Amazon.S3;
using HwProj.ContentService.API.Configuration;
using Microsoft.Extensions.Options;

namespace HwProj.ContentService.API.Extensions;

public static class ConfigureWebApplication
{
    public static WebApplication ConfigureWebApplicationParameters(this WebApplication application)
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

        return application;
    }

    public static async Task CreateBucketIfNotExists(this WebApplication application)
    {
        using var scope = application.Services.CreateScope();
        var amazonS3Client = scope.ServiceProvider.GetService<IAmazonS3>();
        var defaultBucketName = scope.ServiceProvider.GetRequiredService<IOptions<StorageClientConfiguration>>()
            .Value
            .DefaultBucketName;
        if (amazonS3Client == null || defaultBucketName == null)
        {
            throw new ApplicationException("Конфигурация клиента AWS S3 не задана");
        }

        await amazonS3Client.CreateBucketIfNotExists(defaultBucketName);
    }
}