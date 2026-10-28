using System.Text.Json.Serialization;
using HwProj.AuthService.Client;
using HwProj.Common.Net8;
using HwProj.NotificationsService.API.EventHandlers;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.NotificationsService.API.Services.Digest;
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
            services.AddEventBus(Configuration, eventBus => eventBus
                .AddHandler<StudentRegisterEvent, RegisterEventHandler>()
                .AddHandler<RateEvent, RateEventHandler>()
                .AddHandler<StudentPassTaskEvent, StudentPassTaskEventHandler>()
                .AddHandler<UpdateHomeworkEvent, UpdateHomeworkEventHandler>()
                .AddHandler<UpdateTaskMaxRatingEvent, UpdateTaskMaxRatingEventHandler>()
                .AddHandler<LecturerAcceptToCourseEvent, LecturerAcceptToCourseEventHandler>()
                .AddHandler<LecturerRejectToCourseEvent, LecturerRejectToCourseEventHandler>()
                .AddHandler<LecturerInvitedToCourseEvent, LecturerInvitedToCourseEventHandler>()
                .AddHandler<NewHomeworkEvent, NewHomeworkEventHandler>()
                .AddHandler<NewHomeworkTaskEvent, NewHomeworkTaskEventHandler>()
                .AddHandler<InviteLecturerEvent, InviteLecturerEventHandler>()
                .AddHandler<NewCourseMateEvent, NewCourseMateHandler>()
                .AddHandler<PasswordRecoveryEvent, PasswordRecoveryEventHandler>());
            services.AddSingleton<IEmailService, EmailService>();

            services.Configure<DigestOptions>(Configuration.GetSection("Digest"));
            services.AddMemoryCache();
            services.AddScoped<IDigestService, DigestService>();
            services.AddHostedService<DigestBackgroundService>();

            services.AddHttpClient();
            services.AddAuthServiceClient();

            services
                .AddCors()
                .AddControllers()
                .AddJsonOptions(options =>
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

            services.AddAutoMapper(x => x.AddProfile<AutomapperProfile>());
        }

        public void Configure(IApplicationBuilder app, IHostEnvironment env, NotificationsContext context)
        {
            app.UseDatabase(env, context);

            if (env.IsDevelopment()) app.UseDeveloperExceptionPage();
            else app.UseHsts();

            app.UseRouting();
            app.UseCors(x => x
                .AllowAnyMethod()
                .AllowAnyHeader()
                .SetIsOriginAllowed(_ => true)
                .AllowCredentials());

            app.UseEndpoints(x => x.MapControllers());
        }
    }
}
