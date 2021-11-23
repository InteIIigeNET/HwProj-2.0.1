using System;
using System.Net.Http;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.SolutionsService.Client;
using HwProj.TelegramBotAPI.Commands;
using HwProj.TelegramBotAPI.Models;
using HwProj.TelegramBotAPI.Service;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using IHostingEnvironment = Microsoft.AspNetCore.Hosting.IHostingEnvironment;

namespace HwProj.TelegramBotAPI
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
            /*services.AddControllers();*/
            var connectionString = Configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<TelegramBotContext>(options => options.UseSqlServer(connectionString));
            services.AddScoped<TelegramBot>();
            services.AddScoped<ICommandService, CommandService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<Commands.Commands, StartCommand>();
            services.AddScoped<Commands.Commands, GetCourses>();
            services.AddScoped<Commands.Commands, GetHomeworks>();
            services.AddScoped<Commands.Commands, GetTasks>();
            services.AddScoped<Commands.Commands, GetTaskInfo>();
            services.AddScoped<Commands.Commands, GetSolutions>();
            services.AddScoped<Commands.Commands, GetSolutionInfo>();

            var httpClient = new HttpClient();
            services.AddAuthServiceClient(httpClient, "http://localhost:5001");
            services.AddCoursesServiceClient(httpClient, "http://localhost:5002");
            services.AddSolutionServiceClient(httpClient, "http://localhost:5007");

            services.AddEventBus(Configuration);
            services.ConfigureHwProjServices("Telegram API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IServiceProvider serviceProvider)
        {
            app.ConfigureHwProj(env, "Telegram API");
            serviceProvider.GetRequiredService<TelegramBot>().GetBot().Wait();
        }
    }
}