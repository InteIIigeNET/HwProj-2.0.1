using Amazon.S3;
using HwProj.ContentService.API.Configuration;
using HwProj.ContentService.API.Extensions;
using HwProj.Utils.Configuration;
using Microsoft.Extensions.Options;
using IHostingEnvironment = Microsoft.AspNetCore.Hosting.IHostingEnvironment;

var builder = WebApplication.CreateBuilder(args);
builder.Services.ConfigureWithAWS(builder.Configuration);
var app = builder.Build();

// При необходимости создаем пустой бакет в хранилище
using (var scope = app.Services.CreateScope())
{
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

// Не вызываем ConfigureHwProj из-за проблем с app.UseMvc и настройками маппинга контроллеров (.NET 8 / .NET Core 2.2)
var serviceName = app.Services.GetRequiredService<IOptions<ServiceConfiguration>>().Value.ServiceName;
app.ConfigureHwProjApplicationParameters(app.Environment as IHostingEnvironment, serviceName!);
app.UseRouting();
app.MapControllers();

app.Run();