using HwProj.CoursesService.API.Filters;
using HwProj.CoursesService.API.Models;
using HwProj.CoursesService.API.Repositories;
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
            var connection = Configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<CourseContext>(options => options.UseSqlServer(connection));
            services.AddScoped<ICoursesRepository, CoursesRepository>();
            services.AddScoped<ICourseMatesRepository, CourseMatesRepository>();
            services.AddScoped<ICoursesService, Services.CoursesService>();
            services.AddScoped<CourseMentorOnlyAttribute>();
            services.ConfigureHwProjServices("Courses API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.ConfigureHwProj(env, "Courses API");
        }
    }
}
