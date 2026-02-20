using System.Text.Json.Serialization;
using HwProj.AuthService.Client;
using HwProj.Common.Net8;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationsService.API.EventHandlers;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HwProj.EventBus.Client;
using HwProj.NotificationService.Events.AuthService;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.NotificationService.Events.SolutionsService;
using Microsoft.Extensions.Hosting;
using UpdateTaskMaxRatingEvent = HwProj.NotificationService.Events.CoursesService.UpdateTaskMaxRatingEvent;

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
            services.AddScoped<INotificationSettingsService, NotificationSettingsService>();
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
            services.AddTransient<IEventHandler<NewHomeworkTaskEvent>, NewHomeworkTaskEventHandler>();
            services.AddTransient<IEventHandler<InviteLecturerEvent>, InviteLecturerEventHandler>();
            services.AddTransient<IEventHandler<NewCourseMateEvent>, NewCourseMateHandler>();
            services.AddTransient<IEventHandler<PasswordRecoveryEvent>, PasswordRecoveryEventHandler>();
            services.AddSingleton<IEmailService, EmailService>();

            services.AddHttpClient();
            services.AddAuthServiceClient();

            services
                .AddCors()
                .AddControllers()
                .AddJsonOptions(options =>
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

            services.AddAutoMapper(x => x.AddProfile<AutomapperProfile>());
        }

        public void Configure(IApplicationBuilder app, IHostEnvironment env, IEventBus eventBus,
            NotificationsContext context)
        {
            using (var eventBustSubscriber = eventBus.CreateSubscriber())
            {
                eventBustSubscriber.Subscribe<StudentRegisterEvent, RegisterEventHandler>();
                eventBustSubscriber.Subscribe<RateEvent, RateEventHandler>();
                eventBustSubscriber.Subscribe<StudentPassTaskEvent, StudentPassTaskEventHandler>();
                eventBustSubscriber.Subscribe<UpdateHomeworkEvent, UpdateHomeworkEventHandler>();
                eventBustSubscriber.Subscribe<UpdateTaskMaxRatingEvent, UpdateTaskMaxRatingEventHandler>();
                eventBustSubscriber.Subscribe<LecturerAcceptToCourseEvent, LecturerAcceptToCourseEventHandler>();
                eventBustSubscriber.Subscribe<LecturerRejectToCourseEvent, LecturerRejectToCourseEventHandler>();
                eventBustSubscriber.Subscribe<LecturerInvitedToCourseEvent, LecturerInvitedToCourseEventHandler>();
                eventBustSubscriber.Subscribe<NewHomeworkEvent, NewHomeworkEventHandler>();
                eventBustSubscriber.Subscribe<NewHomeworkTaskEvent, NewHomeworkTaskEventHandler>();
                eventBustSubscriber.Subscribe<InviteLecturerEvent, InviteLecturerEventHandler>();
                eventBustSubscriber.Subscribe<NewCourseMateEvent, NewCourseMateHandler>();
                eventBustSubscriber.Subscribe<PasswordRecoveryEvent, PasswordRecoveryEventHandler>();
            }

            if (env.IsDevelopment()) app.UseDeveloperExceptionPage();
            else app.UseHsts();

            app.UseRouting();
            app.UseCors(x => x
                .AllowAnyMethod()
                .AllowAnyHeader()
                .SetIsOriginAllowed(_ => true)
                .AllowCredentials());

            app.UseEndpoints(x => x.MapControllers());

            app.UseDatabase(env, context);
        }
    }
}
