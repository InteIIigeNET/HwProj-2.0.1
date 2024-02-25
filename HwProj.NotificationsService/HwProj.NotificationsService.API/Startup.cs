using Hangfire;
using HwProj.Models.Events.AuthEvents;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.Events.CourseEvents;
using HwProj.NotificationsService.API.EventHandlers;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.Models.Events.SolutionEvents;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

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
            
            // Add Hangfire services.
            services.AddHangfire(configuration => configuration
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UseSqlServerStorage(Configuration.GetConnectionString("HangfireConnection")));

            // Add the processing server as IHostedService
            services.AddHangfireServer();
            services.AddDbContext<NotificationsContext>(options => options.UseSqlServer(connectionString));
            services.AddScoped<INotificationsRepository, NotificationsRepository>();
            services.AddScoped<INotificationSettingsRepository, NotificationSettingsRepository>();
            services.AddEventBus(Configuration);
            services.AddTransient<IScheduleJobsRepository, ScheduleJobsRepository>();
            services.AddTransient<IEventHandler<StudentRegisterEvent>, RegisterEventHandler>();
            services.AddTransient<IEventHandler<RateEvent>, RateEventHandler>();
            services.AddTransient<IEventHandler<StudentPassTaskEvent>, StudentPassTaskEventHandler>();
            services.AddTransient<IEventHandler<UpdateHomeworkEvent>, UpdateHomeworkEventHandler>();
            services.AddTransient<IEventHandler<UpdateTaskEvent>, UpdateTaskEventHandler>();
            services.AddTransient<IEventHandler<DeleteTaskEvent>, DeleteTaskEventHandler>();
            services.AddTransient<IEventHandler<LecturerAcceptToCourseEvent>, LecturerAcceptToCourseEventHandler>();
            services.AddTransient<IEventHandler<LecturerRejectToCourseEvent>, LecturerRejectToCourseEventHandler>();
            services.AddTransient<IEventHandler<LecturerInvitedToCourseEvent>, LecturerInvitedToCourseEventHandler>();
            services.AddTransient<IEventHandler<NewHomeworkEvent>, NewHomeworkEventHandler>();
            services.AddTransient<IEventHandler<NewTaskEvent>, NewHomeworkTaskEventHandler>();
            services.AddTransient<IEventHandler<InviteLecturerEvent>, InviteLecturerEventHandler>();
            services.AddTransient<IEventHandler<NewCourseMateEvent>, NewCourseMateHandler>();
            services.AddTransient<IEventHandler<PasswordRecoveryEvent>, PasswordRecoveryEventHandler>();
            services.AddSingleton<IEmailService, EmailService>();

            services.AddHttpClient();
            services.AddAuthServiceClient();
            services.AddCoursesServiceClient();
            
            services.ConfigureHwProjServices("Notifications API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IEventBus eventBus,
            NotificationsContext context)
        {
            using (var eventBustSubscriber = eventBus.CreateSubscriber())
            {
                eventBustSubscriber.Subscribe<StudentRegisterEvent, RegisterEventHandler>();
                eventBustSubscriber.Subscribe<RateEvent, RateEventHandler>();
                eventBustSubscriber.Subscribe<StudentPassTaskEvent, StudentPassTaskEventHandler>();
                eventBustSubscriber.Subscribe<UpdateHomeworkEvent, UpdateHomeworkEventHandler>();
                eventBustSubscriber.Subscribe<UpdateTaskEvent, UpdateTaskEventHandler>();
                eventBustSubscriber.Subscribe<DeleteTaskEvent, DeleteTaskEventHandler>();
                eventBustSubscriber.Subscribe<LecturerAcceptToCourseEvent, LecturerAcceptToCourseEventHandler>();
                eventBustSubscriber.Subscribe<LecturerRejectToCourseEvent, LecturerRejectToCourseEventHandler>();
                eventBustSubscriber.Subscribe<LecturerInvitedToCourseEvent, LecturerInvitedToCourseEventHandler>();
                eventBustSubscriber.Subscribe<NewHomeworkEvent, NewHomeworkEventHandler>();
                eventBustSubscriber.Subscribe<NewTaskEvent, NewHomeworkTaskEventHandler>();
                eventBustSubscriber.Subscribe<InviteLecturerEvent, InviteLecturerEventHandler>();
                eventBustSubscriber.Subscribe<NewCourseMateEvent, NewCourseMateHandler>();
                eventBustSubscriber.Subscribe<PasswordRecoveryEvent, PasswordRecoveryEventHandler>();
            }
            
            app.UseHangfireDashboard();
            app.ConfigureHwProj(env, "Notifications API", context);
        }
    }
}
