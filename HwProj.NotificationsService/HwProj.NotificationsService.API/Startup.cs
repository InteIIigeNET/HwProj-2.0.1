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
using HwProj.CoursesService.API.Events;
using HwProj.CoursesService.Client;
using HwProj.SolutionsService.API.Events;
using HwProj.SolutionsService.Client;
using UpdateTaskMaxRatingEvent = HwProj.CoursesService.API.Events.UpdateTaskMaxRatingEvent;

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
            var connectionString = ConnectionString.GetConnectionString(Configuration);
            services.AddDbContext<NotificationsContext>(options => options.UseSqlServer(connectionString));
            services.AddScoped<INotificationsRepository, NotificationsRepository>();
            services.AddEventBus(Configuration);
            services.AddTransient<IEventHandler<StudentRegisterEvent>, RegisterEventHandler>();
            services.AddTransient<IEventHandler<RateEvent>, RateEventHandler>();
            services.AddTransient<IEventHandler<StudentPassTaskEvent>, StudentPassTaskEventHandler>();
            services.AddTransient<IEventHandler<UpdateHomeworkEvent>, UpdateHomeworkEventHandler>();
            services.AddTransient<IEventHandler<UpdateTaskMaxRatingEvent>, UpdateTaskMaxRatingEventHandler>();
            services.AddTransient<IEventHandler<LecturerAcceptToCourseEvent>, LecturerAcceptToCourseEventHandler>();
            services.AddTransient<IEventHandler<LecturerRejectToCourseEvent>, LecturerRejectToCourseEventHandler>();
            services.AddTransient<IEventHandler<LecturerInvitedToCourseEvent>, LecturerInvitedToCourseEventHandler>();
            services.AddTransient<IEventHandler<NewHomeworkEvent>, NewHomeworkEventHandler>();
            services.AddTransient<IEventHandler<InviteLecturerEvent>, InviteLecturerEventHandler>();
            services.AddTransient<IEventHandler<NewCourseMateEvent>, NewCourseMateHandler>();
            services.AddSingleton<IEmailService, EmailService>();

            services.AddHttpClient();
            services.AddAuthServiceClient();
            services.AddCoursesServiceClient();
            services.AddSolutionServiceClient();

            services.ConfigureHwProjServices("Notifications API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IEventBus eventBus)
        {
            eventBus.Subscribe<StudentRegisterEvent>();
            eventBus.Subscribe<InviteLecturerEvent>();
            eventBus.Subscribe<RateEvent>();
            eventBus.Subscribe<UpdateHomeworkEvent>();
            eventBus.Subscribe<StudentPassTaskEvent>();
            eventBus.Subscribe<UpdateTaskMaxRatingEvent>();
            eventBus.Subscribe<LecturerAcceptToCourseEvent>();
            eventBus.Subscribe<LecturerRejectToCourseEvent>();
            eventBus.Subscribe<LecturerInvitedToCourseEvent>();
            eventBus.Subscribe<NewHomeworkEvent>();
            eventBus.Subscribe<NewCourseMateEvent>();
            app.ConfigureHwProj(env, "Notifications API");
        }
    }
}
