using HwProj.AuthService.API.Events;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationsService.API.EventHandlers;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;
using HwProj.CoursesService.Client;
using HwProj.CoursesService.API.Events;

namespace HwProj.NotificationsService.API
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
            services.AddDbContext<NotificationsContext>(options => options.UseSqlServer(connectionString));
            services.AddScoped<INotificationsRepository, NotificationsRepository>();
            services.AddScoped<INotificationsService, Services.NotificationsService>();
            services.AddEventBus(Configuration);
            services.AddTransient<IEventHandler<StudentRegisterEvent>, RegisterEventHandler>();
            services.AddTransient<IEventHandler<InviteLecturerEvent>, InviteLecturerEventHandler>();
            services.AddTransient<IEventHandler<NewCourseMateEvent>, NewCourseMateHandler>();

            var httpClient = new HttpClient();
            services.AddAuthServiceClient(httpClient, "http://localhost:5001");
            // services.AddCoursesServiceClient(httpClient, "http://localhost:5002"); ?

            services.ConfigureHwProjServices("Notifications API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IEventBus eventBus)
        {
            eventBus.Subscribe<StudentRegisterEvent>();
            eventBus.Subscribe<InviteLecturerEvent>();
            eventBus.Subscribe<NewCourseMateEvent>();
            app.ConfigureHwProj(env, "Notifications API");
        }
    }
}
