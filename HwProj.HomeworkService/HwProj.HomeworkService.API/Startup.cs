using HwProj.EventBus.Client.Interfaces;
using HwProj.HomeworkService.API.Events;
using HwProj.HomeworkService.API.Models;
using HwProj.HomeworkService.API.Repositories;
using HwProj.HomeworkService.API.Services;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.HomeworkService.API
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
            services.AddDbContext<HomeworkContext>(options => options.UseSqlServer(connectionString));
            services.AddScoped<IHomeworksRepository, HomeworksRepository>();
            services.AddScoped<ITasksRepository, TasksRepository>();
            services.AddScoped<IHomeworksService, HomeworksService>();
            services.AddScoped<ITasksService, TasksService>();

            services.AddEventBus(Configuration);
            
            services.ConfigureHwProjServices("Homeworks API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IEventBus eventBus)
        {
            eventBus.Subscribe<RequestMaxRatingEvent>();
            app.ConfigureHwProj(env, "Homeworks API");
        }
    }
}
