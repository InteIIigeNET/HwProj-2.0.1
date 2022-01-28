using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using AutoMapper;
using HwProj.EventBus.Client;
using HwProj.EventBus.Client.Implementations;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Utils.Authorization;
using HwProj.Utils.Configuration.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
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
                .AddCors()
                .AddMvc()
                .AddJsonOptions(options =>
                    options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore)
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Info { Title = serviceName, Version = "v1" });

                if (serviceName == "API Gateway")
                {
                    c.AddSecurityDefinition("Bearer",
                        new ApiKeyScheme
                        {
                            In = "header",
                            Description = "Please enter into field the word 'Bearer' following by space and JWT",
                            Name = "Authorization",
                            Type = "apiKey"
                        });
                    c.AddSecurityRequirement(new Dictionary<string, IEnumerable<string>> {
                        { "Bearer", Enumerable.Empty<string>() },
                    });
                }
            });

            if (serviceName != "AuthService API")
            {
                services.AddAuthentication(options =>
                    {
                        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                    })
                    .AddJwtBearer(x =>
                    {
                        x.RequireHttpsMetadata = false; //TODO: dev env setting
                        x.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidIssuer = "AuthService",
                            ValidateIssuer = true,
                            ValidateAudience = false,
                            ValidateLifetime = true,
                            IssuerSigningKey = AuthorizationKey.SecurityKey,
                            ValidateIssuerSigningKey = true
                        };
                    });
            }

            services.AddTransient<NoApiGatewayMiddleware>();

            services.AddHttpContextAccessor();

            return services;
        }

        public static IServiceCollection AddEventBus(this IServiceCollection services, IConfiguration configuration)
        {
            var eventBusSection = configuration.GetSection("EventBus");

            var retryCount = 5;
            if (!string.IsNullOrEmpty(eventBusSection["EventBusRetryCount"]))
            {
                retryCount = int.Parse(eventBusSection["EventBusRetryCount"]);
            }

            services.AddSingleton(sp => Policy.Handle<SocketException>()
                .Or<BrokerUnreachableException>()
                .WaitAndRetry(retryCount, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))));

            services.AddSingleton<IConnectionFactory, ConnectionFactory>(sp => new ConnectionFactory
            {
                HostName = eventBusSection["EventBusHostName"],
                UserName = eventBusSection["EventBusUserName"],
                Password = eventBusSection["EventBusPassword"],
                VirtualHost = eventBusSection["EventBusVirtualHost"]
            });

            services.AddSingleton<IDefaultConnection, DefaultConnection>();
            services.AddSingleton<IEventBus, EventBusRabbitMq>();

            var types = AppDomain.CurrentDomain.GetAssemblies().SelectMany(x => x.GetTypes()).ToList();
            var eventTypes = types.Where(x => typeof(Event).IsAssignableFrom(x));
            foreach (var eventType in eventTypes)
            {
                var fullTypeInterface = typeof(IEventHandler<>).MakeGenericType(eventType);
                var handlersTypes = types.Where(x =>
                    fullTypeInterface.IsAssignableFrom(x) && !x.IsInterface && !x.IsAbstract);

                foreach (var handlerType in handlersTypes)
                {
                    services.AddTransient(handlerType);
                }
            }

            return services;
        }

        public static IApplicationBuilder ConfigureHwProj(this IApplicationBuilder app, IHostingEnvironment env,
            string serviceName)
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

            app.UseAuthentication();
            app.UseCors(x => x
                .AllowAnyMethod()
                .AllowAnyHeader()
                .SetIsOriginAllowed(origin => true)
                .AllowCredentials());
            app.UseMvc();

            return app;
        }
    }
}
