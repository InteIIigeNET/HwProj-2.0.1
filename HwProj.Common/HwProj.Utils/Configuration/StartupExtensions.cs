using System;
using AutoMapper;
using HwProj.Utils.Configuration.Middleware;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Swashbuckle.AspNetCore.Swagger;

namespace HwProj.Utils.Configuration
{
    public static class StartupExtensions
    {
        public static IServiceCollection ConfigureHwProjServices(this IServiceCollection services, string serviceName)
        {
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies())
                .AddMvc()
                .AddJsonOptions(options =>
                    options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore)
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddSwaggerGen(c => { c.SwaggerDoc("v1", new Info {Title = serviceName, Version = "v1"}); })
                .AddCors(options =>
                {
                    options.AddPolicy("CorsPolicy",
                        builder => builder
                            .SetIsOriginAllowed((host) => true)
                            .AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowCredentials());
                });

            services.AddTransient<NoApiGatewayMiddleware>();

            return services;
        }

        public static void ConfigureHwProj(this IApplicationBuilder app, IHostingEnvironment env, string serviceName)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage()
                    .UseSwagger()
                    .UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", serviceName); });
                   // .UseMiddleware<NoApiGatewayMiddleware>();

            }
            else
            {
                app.UseHsts();
            }

            app.UseHttpsRedirection()
                .UseMvc();
        }
    }
}