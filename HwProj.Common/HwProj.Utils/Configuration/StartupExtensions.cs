using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Threading;
using AutoMapper;
using HwProj.EventBus.Client;
using HwProj.EventBus.Client.Implementations;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Utils.Auth;
using HwProj.Utils.Configuration.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using Polly;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;

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

            ConfigureHwProjServiceSwaggerGen(services, serviceName);
            ConfigureHwProjServiceAuthentication(services, serviceName);

            services.AddTransient<NoApiGatewayMiddleware>();
            services.AddHttpContextAccessor();
            return services;
        }

        public static void ConfigureHwProjServiceSwaggerGen(this IServiceCollection services, string serviceName)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo() { Title = serviceName, Version = "v1" });
                c.CustomOperationIds(apiDesc =>
                {
                    var controllerName = apiDesc.ActionDescriptor.RouteValues["controller"];
                    var actionName = apiDesc.ActionDescriptor.RouteValues["action"];
                    return $"{controllerName}{actionName}";
                });
                if (serviceName == "API Gateway")
                {
                    c.AddSecurityDefinition("Bearer",
                        new OpenApiSecurityScheme()
                        {
                            In = ParameterLocation.Header,
                            Description = "Please enter into field the word 'Bearer' following by space and JWT",
                            Name = "Authorization",
                            Type = SecuritySchemeType.ApiKey
                        });
                    c.AddSecurityRequirement(
                        new OpenApiSecurityRequirement
                        {
                            { new OpenApiSecurityScheme
                                {
                                    Reference = new OpenApiReference
                                    {
                                        Id = "Bearer",
                                        Type = ReferenceType.SecurityScheme
                                    }
                                },
                                new List<string>()
                            }
                        });
                }
            });
        }

        public static void ConfigureHwProjServiceAuthentication(this IServiceCollection services, string serviceName)
        {
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
            string serviceName, DbContext? context = null)
        {
            app.ConfigureHwProjApplicationParameters(env, serviceName);
            app.UseMvc();

            if (context != null)
            {
                if (env.IsDevelopment())
                {
                    context.Database.EnsureCreated();
                    return app;
                }

                var logger = app.ApplicationServices
                    .GetService<ILoggerFactory>()
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

        public static void ConfigureHwProjApplicationParameters(this IApplicationBuilder app, IHostingEnvironment env,
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
        }

        public static IServiceCollection AddUserIdAuthentication(this IServiceCollection services)
        {
            services
                .AddAuthentication(AuthSchemeConstants.UserIdAuthentication)
                .AddScheme<UserIdAuthenticationOptions, UserIdAuthenticationHandler>(
                    AuthSchemeConstants.UserIdAuthentication, null);

            return services;
        }
    }
}