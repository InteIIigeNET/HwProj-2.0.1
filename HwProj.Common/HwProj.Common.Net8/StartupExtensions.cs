using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HwProj.Common.Net8;

public static class StartupExtensions
{
    public static IApplicationBuilder UseDatabase(this IApplicationBuilder app, IHostEnvironment env, DbContext? context = null)
    {
        if (context == null) return app;
        if (env.IsDevelopment())
        {
            context.Database.EnsureCreated();
            return app;
        }

        var logger = app.ApplicationServices
            .GetService<ILoggerFactory>()!
            .CreateLogger(typeof(StartupExtensions));

        var tries = 0;
        const int maxTries = 100;

        while (!context.Database.CanConnect() && ++tries <= maxTries)
        {
            logger.LogWarning($"Can't connect to database. Try {tries}.");
            Thread.Sleep(5000);
        }

        if (tries > maxTries) throw new Exception("Can't connect to database");
        context.Database.Migrate();

        return app;
    }
}
