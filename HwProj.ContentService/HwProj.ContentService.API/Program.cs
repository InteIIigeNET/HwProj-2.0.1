using HwProj.ContentService.API.Extensions;

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

// При последней остановке сервиса могли произойти ошибки при записи или удалении файлов.
// Выполняем восстановление
await app.RecoveryContentService();

app.Run();