using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;
using HwProj.APIGateway.API.Filters;
using HwProj.AuthService.Client;
using HwProj.ContentService.Client;
using HwProj.CoursesService.Client;
using HwProj.NotificationsService.Client;
using HwProj.SolutionsService.Client;
using IStudentsInfo;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StudentsInfo;

namespace HwProj.APIGateway.API;

public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        services
            .AddCors()
            .AddControllers()
            .AddJsonOptions(options =>
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

        services.AddHttpContextAccessor();
        services.AddAutoMapper(x => x.AddProfile<ApplicationProfile>());
        services.Configure<FormOptions>(options => { options.MultipartBodyLengthLimit = 200 * 1024 * 1024; });
        ConfigureHwProjServiceSwaggerGen(services);

        services.AddSingleton<IStudentsInformationProvider>(provider =>
            new StudentsInformationProvider(Configuration["StudentsInfo:Login"],
                Configuration["StudentsInfo:Password"],
                Configuration["StudentsInfo:LdapHost"], int.Parse(Configuration["StudentsInfo:LdapPort"]),
                Configuration["StudentsInfo:SearchBase"]));

        var appSettings = Configuration.GetSection("Security");

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, x =>
            {
                x.RequireHttpsMetadata = false;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = "AuthService",
                    ValidateIssuer = true,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    IssuerSigningKey =
                        new SymmetricSecurityKey(Encoding.ASCII.GetBytes(appSettings["SecurityKey"])),
                    ValidateIssuerSigningKey = true
                };
            });

        services.AddHttpClient();
        services.AddHttpContextAccessor();

        services.AddAuthServiceClient();
        services.AddCoursesServiceClient();
        services.AddSolutionServiceClient();
        services.AddNotificationsServiceClient();
        services.AddContentServiceClient();

        services.AddScoped<CourseMentorOnlyAttribute>();
        services.AddScoped<FilesPrivacyFilter>();
    }

    public void Configure(IApplicationBuilder app, IHostEnvironment env)
    {
        if (env.IsDevelopment())
            app.UseDeveloperExceptionPage()
                .UseSwagger()
                .UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "API Gateway"); });
        else
            app.UseHsts();

        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseCors(x => x
            .AllowAnyMethod()
            .AllowAnyHeader()
            .SetIsOriginAllowed(_ => true)
            .AllowCredentials());

        app.UseEndpoints(x => x.MapControllers());
    }

    private static void ConfigureHwProjServiceSwaggerGen(IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "API Gateway", Version = "v1" });
            c.CustomOperationIds(apiDesc =>
            {
                var controllerName = apiDesc.ActionDescriptor.RouteValues["controller"];
                var actionName = apiDesc.ActionDescriptor.RouteValues["action"];
                return $"{controllerName}{actionName}";
            });
            c.AddSecurityDefinition("Bearer",
                new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter into field the word 'Bearer' following by space and JWT",
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey
                });
            c.AddSecurityRequirement(
                new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
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
        });
    }
}
