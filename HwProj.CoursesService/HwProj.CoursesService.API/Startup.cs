using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
using HwProj.CoursesService.API.Repositories.Groups;
using HwProj.CoursesService.API.Services;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;

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
            var connection = Configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<CourseContext>(options => options.UseSqlServer(connection));
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

            services.AddEventBus(Configuration);

            services.AddHttpContextAccessor();
            services.AddHttpClient();
            services.AddAuthServiceClient();

            services.ConfigureHwProjServices("Courses API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.ConfigureHwProj(env, "Courses API");
        }
    }
}