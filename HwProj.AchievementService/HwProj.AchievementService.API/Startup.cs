using System.Net.Http;
using HwProj.AchievementService.API.Models;
using HwProj.AchievementService.API.Repositories;
using HwProj.AchievementService.API.Services;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.AchievementService.API
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
            var connectionString = Configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<AchievementContext>(options => options.UseSqlServer(connectionString));
            services.AddScoped<IAchievementsRepository, AchievementsRepository>();
            services.AddScoped<IAchievementService, Services.AchievementService>();

            var httpClient = new HttpClient();
            services.AddAuthServiceClient(httpClient, "http://localhost:5001");

            services.AddEventBus(Configuration);
            services.ConfigureHwProjServices("Achievements API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IEventBus eventBus)
        {
            app.ConfigureHwProj(env, "Achievements API");
        }
    }
}