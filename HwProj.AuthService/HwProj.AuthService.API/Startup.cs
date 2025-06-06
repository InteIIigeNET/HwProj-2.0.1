﻿using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using HwProj.AuthService.API.Services;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using HwProj.Utils.Configuration;
using HwProj.Models.AuthService.ViewModels;
using HwProj.Models.Roles;
using HwProj.Utils.Auth;

namespace HwProj.AuthService.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.ConfigureHwProjServices("AuthService API");

            //var appSettingsSection = Configuration.GetSection("AppSettings");
            //services.Configure<AppSettings>(appSettingsSection);

            services.AddAuthentication(options => { options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme; })
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

            services.AddHttpClient();

            var connectionString = ConnectionString.GetConnectionString(Configuration);
            services.AddDbContext<IdentityContext>(options =>
                options.UseSqlServer(connectionString));

            services.AddIdentity<User, IdentityRole>(opts =>
                {
                    opts.User.RequireUniqueEmail = true;
                    opts.Password.RequiredLength = 6;
                    opts.Password.RequireNonAlphanumeric = false;
                    opts.Password.RequireLowercase = false;
                    opts.Password.RequireUppercase = false;
                    opts.Password.RequireDigit = false;
                })
                .AddEntityFrameworkStores<IdentityContext>()
                .AddUserManager<UserManager<User>>()
                .AddRoleManager<RoleManager<IdentityRole>>()
                .AddDefaultTokenProviders();

            services.AddEventBus(Configuration);

            services.AddScoped<IAuthTokenService, AuthTokenService>()
                .AddScoped<IAccountService, AccountService>()
                .AddScoped<IExpertsService, ExpertsService>()
                .AddScoped<IUserManager, ProxyUserManager>()
                .AddScoped<IExpertsRepository, ExpertsRepository>();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IdentityContext context)
        {
            app.ConfigureHwProj(env, "AuthService API", context);

            using (var scope = app.ApplicationServices.CreateScope())
            {
                var userManager = scope.ServiceProvider.GetService(typeof(UserManager<User>)) as UserManager<User>;

                var rolesManager =
                    scope.ServiceProvider.GetService(typeof(RoleManager<IdentityRole>)) as RoleManager<IdentityRole>;
                var eventBus = scope.ServiceProvider.GetService<IEventBus>();

                if (env.IsDevelopment())
                {
                    RoleInitializer.InitializeAsync(userManager, rolesManager, eventBus).Wait();
                }
            }
        }
    }
}
