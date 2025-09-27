using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HwProj.AuthService.API.Models;
using HwProj.AuthService.API.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using HwProj.AuthService.API.Services;
using HwProj.Common.Net8;
using HwProj.EventBus.Client;
using HwProj.EventBus.Client.Interfaces;
using Microsoft.Extensions.Hosting;
using User = HwProj.AuthService.API.Models.User;

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
            services
                .AddCors()
                .AddControllers()
                .AddJsonOptions(options =>
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

            services.AddAutoMapper(x => x.AddProfile<ApplicationProfile>());
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

        public void Configure(IApplicationBuilder app, IHostEnvironment env, IdentityContext context)
        {
            if (env.IsDevelopment()) app.UseDeveloperExceptionPage();
            else app.UseHsts();

            app.UseRouting();
            app.UseAuthentication();
            app.UseCors(x => x
                .AllowAnyMethod()
                .AllowAnyHeader()
                .SetIsOriginAllowed(_ => true)
                .AllowCredentials());

            app.UseEndpoints(x => x.MapControllers());

            app.UseDatabase(env, context);

            using var scope = app.ApplicationServices.CreateScope();
            var userManager = scope.ServiceProvider.GetService<UserManager<User>>();

            var rolesManager = scope.ServiceProvider.GetService<RoleManager<IdentityRole>>();
            var eventBus = scope.ServiceProvider.GetService<IEventBus>();

            if (env.IsDevelopment())
            {
                RoleInitializer.InitializeAsync(userManager, rolesManager, eventBus).Wait();
            }
        }
    }
}
