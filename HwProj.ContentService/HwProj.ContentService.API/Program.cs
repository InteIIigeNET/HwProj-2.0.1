using HwProj.ContentService.API.Extensions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.ConfigureWithAWS(builder.Configuration);
var app = builder.Build();

// При необходимости создаем пустой бакет в хранилище
await app.CreateBucketIfNotExists();

// Не вызываем ConfigureHwProj из-за проблем с app.UseMvc и настройками маппинга контроллеров (.NET 8 / .NET Core 2.2)
app.ConfigureWebApplicationParameters();
app.Run();