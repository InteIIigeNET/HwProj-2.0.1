using System.Data.SqlClient;
using Hangfire;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.API.Repositories.Groups;
using HwProj.CoursesService.API.Services;
using HwProj.CoursesService.API.EventHandlers;
using HwProj.EventBus.Client.Interfaces;
using HwProj.SolutionsService.API.Events;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.CoursesService.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        private IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            var connectionString = ConnectionString.GetConnectionString(Configuration);
            services.AddDbContext<CourseContext>(options => options.UseSqlServer(connectionString));
            services.AddScoped<ICoursesRepository, CoursesRepository>();
            services.AddScoped<ICourseMatesRepository, CourseMatesRepository>();
            services.AddScoped<IGroupsRepository, GroupsRepository>();
            services.AddScoped<IGroupMatesRepository, GroupMatesRepository>();
            services.AddScoped<ITaskModelsRepository, TaskModelsRepository>();
            services.AddScoped<IHomeworksRepository, HomeworksRepository>();
            services.AddScoped<ITasksRepository, TasksRepository>();
            services.AddScoped<ICoursesService, Services.CoursesService>();
            services.AddScoped<IGroupsService, GroupsService>();
            services.AddScoped<IHomeworksService, HomeworksService>();
            services.AddScoped<ITasksService, TasksService>();
            services.AddScoped<CourseMentorOnlyAttribute>();
            services.AddScoped<IDeadlinesRepository, DeadlinesRepository>();
            services.AddScoped<IDeadlinesService, DeadlinesService>();

            services.AddHangfire(configuration => configuration
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UseSqlServerStorage(GetHangfireConnectionString()));
            services.AddHangfireServer();

            services.AddEventBus(Configuration);

            services.AddHttpClient();
            services.AddAuthServiceClient();

            services.ConfigureHwProjServices("Courses API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IEventBus eventBus)
        {
            using (var eventBustSubscriber = eventBus.CreateSubscriber())
            {
                eventBustSubscriber.Subscribe<RequestCalculatedMaxRatingEvent, RequestCalculatedMaxRatingEventHandler>();
            }
            
            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                var context = serviceScope.ServiceProvider.GetRequiredService<CourseContext>();
                context.Database.EnsureCreated();
            }
            app.UseHangfireDashboard();
            app.ConfigureHwProj(env, "Courses API");
        }
        
        private string GetHangfireConnectionString()
        {
            var connectionStringFormat = Configuration.GetConnectionString("HangfireConnection");

            using var connection = new SqlConnection(("Server=(localdb)\\mssqllocaldb;Database=master;Trusted_Connection=True;"));
            connection.Open();

            using var command = new SqlCommand(string.Format(
                @"IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'{0}') create database [{0}];", "HangfireDB"),
                connection
                );
            command.ExecuteNonQuery();

            return connectionStringFormat;
        } 
    }
}