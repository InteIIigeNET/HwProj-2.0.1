using HwProj.ContentService.API.Extensions;
using HwProj.ContentService.API.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);
builder.Services.ConfigureWithAWS(builder.Configuration);

// Увеличиваем размер принимаемых запросов до 200 МБ
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 200 * 1024 * 1024;
});
// Увеличиваем допустимое время ожидания ASP.NET при остановке сервиса
builder.WebHost.UseShutdownTimeout(TimeSpan.FromMinutes(10));

var app = builder.Build();

// Не вызываем ConfigureHwProj из-за проблем с app.UseMvc и настройками маппинга контроллеров (.NET 8 / .NET Core 2.2)
app.ConfigureWebApp();

// При необходимости создаем пустой бакет в хранилище
await app.CreateBucketIfNotExists();

// В результате последней остановки сервиса некоторые файлы могли остаться в "промежуточном" состоянии Uploading или Deleting.
// После старта приложения отправим для этих файлов сообщения в канал, чтобы их попробовали загрузить/удалить и обновили статус.
var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
lifetime.ApplicationStarted.Register(async () =>
{
    using var scope = app.Services.CreateScope();
    var recoveryService = scope.ServiceProvider.GetRequiredService<IRecoveryService>();
    await recoveryService.ReProcessPendingFiles();
});

app.Run();