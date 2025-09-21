using System;
using System.Collections.Generic;
using System.Threading;
using AutoMapper;
using HwProj.Utils.Auth;
using HwProj.Utils.Configuration.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;

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

            services.ConfigureHwProjServiceSwaggerGen(serviceName);
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

        public static IApplicationBuilder ConfigureHwProj(this IApplicationBuilder app, IHostingEnvironment env,
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

            app.UseAuthentication();
            app.UseCors(x => x
                .AllowAnyMethod()
                .AllowAnyHeader()
                .SetIsOriginAllowed(origin => true)
                .AllowCredentials());
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