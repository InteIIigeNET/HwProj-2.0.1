using HwProj.CourseWorkService.API.Events;
using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories.Implementations;
using HwProj.CourseWorkService.API.Repositories.Interfaces;
using HwProj.CourseWorkService.API.Services.Implementations;
using HwProj.CourseWorkService.API.Services.Interfaces;
using HwProj.EventBus.Client.Interfaces;
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

            services.AddScoped<IApplicationsRepository, ApplicationsRepository>()
                .AddScoped<ICourseWorksRepository, CourseWorksRepository>()
                .AddScoped<IDeadlineRepository, DeadlineRepository>()
                .AddScoped<IDepartmentRepository, DepartmentRepository>()
                .AddScoped<IDirectionRepository, DirectionRepository>()
                .AddScoped<IUsersRepository, UsersRepository>()
                .AddScoped<IWorkFilesRepository, WorkFilesRepository>()
                .AddScoped<IApplicationsService, ApplicationService>()
                .AddScoped<ICourseWorksService, CourseWorksService>()
                .AddScoped<IReviewService, ReviewService>()
                .AddScoped<IUniversityService, UniversityService>()
                .AddScoped<IUserService, UserService>()
                .AddScoped<IViewModelService, ViewModelService>();

            services.AddEventBus(Configuration);

            services.ConfigureHwProjServices("CourseWorks API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IEventBus eventBus)
        {
            eventBus.Subscribe<StudentRegisterEvent>();
            eventBus.Subscribe<InviteLecturerEvent>();
            eventBus.Subscribe<AdminRegisterEvent>();
            eventBus.Subscribe<EditEvent>();

            app.UseDeveloperExceptionPage();
            app.ConfigureHwProj(env, "CourseWorks API");
        }
    }
}
