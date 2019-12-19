using System;
using System.Linq;
using System.Net.Sockets;
using AutoMapper;
using HwProj.EventBus.Client;
using HwProj.EventBus.Client.Implementations;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Utils.Configuration.Middleware;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Polly;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
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
                            .AllowAnyOrigin()
                            .AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowCredentials());
                });

            services.AddTransient<NoApiGatewayMiddleware>();

            return services;
        }

        public static IServiceCollection AddEventBus(this IServiceCollection services, IConfiguration configuration)
        {
            var retryCount = 5;
            if (!string.IsNullOrEmpty(configuration["EventBusRetryCount"]))
            {
                retryCount = int.Parse(configuration["EventBusRetryCount"]);
            }

            services.AddSingleton(sp => Policy.Handle<SocketException>()
                .Or<BrokerUnreachableException>()
                .WaitAndRetry(retryCount, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))));

            services.AddSingleton<IConnectionFactory, ConnectionFactory>(sp => new ConnectionFactory
            {
                HostName = configuration["EventBusHostName"],
                UserName = configuration["EventBusUserName"],
                Password = configuration["EventBusPassword"],
                VirtualHost = configuration["EventBusVirtualHost"]
            });

            services.AddSingleton<IDefaultConnection, DefaultConnection>();
            services.AddSingleton<IEventBus, EventBusRabbitMq>();

            var types = AppDomain.CurrentDomain.GetAssemblies().SelectMany(x => x.GetTypes()).ToList();
            var eventTypes = types.Where(x => typeof(Event).IsAssignableFrom(x));
            foreach (var eventType in eventTypes)
            {
                var fullTypeInterface = typeof(IEventHandler<>).MakeGenericType(eventType);
                var handlersTypes = types.Where(x => fullTypeInterface.IsAssignableFrom(x) && !x.IsInterface && !x.IsAbstract);

                foreach (var handlerType in handlersTypes)
                {
                    services.AddTransient(handlerType);
                }
            }

            return services;
        }

        public static void ConfigureHwProj(this IApplicationBuilder app, IHostingEnvironment env, string serviceName)
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

            app.UseCors("CorsPolicy");
            app.UseHttpsRedirection()
                .UseMvc();
        }
    }
}