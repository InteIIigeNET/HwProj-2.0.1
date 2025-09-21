using System.Reflection;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;

namespace HwProj.Common.Net8;

public static class StartupExtensions
{
    public static IServiceCollection ConfigureHwProjServices(this IServiceCollection services, string serviceName)
    {
        services.AddAutoMapper(x => x.AddMaps(Assembly.GetCallingAssembly()))
            .AddCors()
            .AddControllers()
            .AddJsonOptions(options =>
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

        services.ConfigureHwProjServiceSwaggerGen(serviceName);
        services.AddHttpContextAccessor();

        return services;
    }

    private static void ConfigureHwProjServiceSwaggerGen(this IServiceCollection services, string serviceName)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = serviceName, Version = "v1" });
            c.CustomOperationIds(apiDesc =>
            {
                var controllerName = apiDesc.ActionDescriptor.RouteValues["controller"];
                var actionName = apiDesc.ActionDescriptor.RouteValues["action"];
                return $"{controllerName}{actionName}";
            });
        });
    }

    public static IApplicationBuilder ConfigureHwProj(this IApplicationBuilder app, IHostEnvironment env,
        string serviceName, DbContext? context = null)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage()
                .UseSwagger()
                .UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", serviceName); });
        }
        else
        {
            app.UseHsts();
        }

        app.UseRouting();
        app.UseAuthentication();
        app.UseCors(x => x
            .AllowAnyMethod()
            .AllowAnyHeader()
            .SetIsOriginAllowed(_ => true)
            .AllowCredentials());

        app.UseEndpoints(x => x.MapControllers());

        if (context != null)
        {
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
        }

        return app;
    }
}
