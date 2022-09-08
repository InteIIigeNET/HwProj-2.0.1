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

            services.AddEventBus(Configuration);

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