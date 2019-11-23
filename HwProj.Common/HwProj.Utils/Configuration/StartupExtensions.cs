using System;
using System.Collections.Generic;
using System.Net.Sockets;
using AutoMapper;
using HwProj.EventBus;
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
                            .SetIsOriginAllowed((host) => true)
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

            var policy = Policy.Handle<SocketException>()
                   .Or<BrokerUnreachableException>()
                   .WaitAndRetry(retryCount, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

            services.AddSingleton<ISubscriptionsManager, SubscriptionsManager>();

            services.AddSingleton<IDefaultConnection, DefaultConnection>(sp =>
            {
                var factory = new ConnectionFactory()
                {
                    HostName = configuration["EventBusHostName"],
                    UserName = configuration["EventBusUserName"],
                    Password = configuration["EventBusPassword"],
                    VirtualHost = configuration["EventBusVirtualHost"]
                };

                return new DefaultConnection(policy, factory);
            });

            services.AddSingleton<IEventBus, EventBusRabbitMQ>(sp =>
            {
                var defaultConnection = sp.GetRequiredService<IDefaultConnection>();
                var subcriptionsManager = sp.GetRequiredService<ISubscriptionsManager>();

                var queueName = "HwProj";
                if (!string.IsNullOrEmpty(configuration["EventBusQueueName"]))
                {
                    queueName = configuration["EventBusQueueName"];
                }

                return new EventBusRabbitMQ(defaultConnection, subcriptionsManager, sp, queueName, policy);
            });

            return services;
        }

        public static void ConfigureHwProj(this IApplicationBuilder app, IHostingEnvironment env, string serviceName)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage()
                    .UseSwagger()
                    .UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", serviceName); })
                    .UseMiddleware<NoApiGatewayMiddleware>();
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