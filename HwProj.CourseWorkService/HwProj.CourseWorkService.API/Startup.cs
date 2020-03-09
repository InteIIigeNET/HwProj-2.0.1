using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.CourseWorkService.API.Services;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.CourseWorkService.API
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
            var connection = Configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<CourseWorkContext>(options => options.UseSqlServer(connection));

            services.AddScoped<ICourseWorksRepository, CourseWorksRepository>()
                .AddScoped<IApplicationsRepository, ApplicationsRepository>()
                .AddScoped<IDeadlinesRepository, DeadlinesRepository>()
                .AddScoped<IWorkFilesRepository, WorkFilesRepository>()
                .AddScoped<IUsersRepository, UsersRepository>()
                .AddScoped<IBidsRepository, BidsRepository>()
                .AddScoped<IBiddingService, BiddingService>()
                .AddScoped<IApplicationService, ApplicationService>()
                .AddScoped<IDeadlineService, DeadlineService>()
                .AddScoped<IWorkFilesService, WorkFilesService>()
                .AddScoped<IUserService, UserService>()
                .AddScoped<ICourseWorkService, Services.CourseWorkService>();
            services.ConfigureHwProjServices("CourseWorks API");
        }


        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseDeveloperExceptionPage();
            app.ConfigureHwProj(env, "CourseWorks API");
        }
    }
}
