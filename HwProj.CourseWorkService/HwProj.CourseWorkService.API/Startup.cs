using HwProj.CourseWorkService.API.Models;
using HwProj.CourseWorkService.API.Repositories;
using HwProj.CourseWorkService.API.Services;
using HwProj.Models.Roles;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
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

            services.AddIdentity<User, IdentityRole>()
                .AddEntityFrameworkStores<CourseWorkContext>()
                .AddUserManager<UserManager<User>>()
                .AddRoleManager<RoleManager<IdentityRole>>();

            services.AddIdentityCore<Student>()
                .AddEntityFrameworkStores<CourseWorkContext>();
            
            services.AddScoped<ICourseWorksRepository, CourseWorksRepository>()
                .AddScoped<IApplicationsRepository, ApplicationsRepository>()
                //.AddScoped<IDeadlinesRepository, DeadlinesRepository>()
                //.AddScoped<IWorkFilesRepository, WorkFilesRepository>()
                //.AddScoped<IBidsRepository, BidsRepository>()
                .AddScoped<IApplicationsService, ApplicationService>()
                .AddScoped<ICourseWorksService, CourseWorksService>();

            services.ConfigureHwProjServices("CourseWorks API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseDeveloperExceptionPage();
            app.ConfigureHwProj(env, "CourseWorks API");
        }

        private async void Initialize(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            if (await roleManager.FindByNameAsync(Roles.LecturerRole) == null)
            {
                await roleManager.CreateAsync(Roles.Lecturer);
            }

            if (await roleManager.FindByNameAsync(Roles.StudentRole) == null)
            {
                await roleManager.CreateAsync(Roles.Student);
            }

            const string email = "Vlad@mail.ru";
            const string password = "123456";

            if (await userManager.FindByEmailAsync(email) == null)
            {
                var admin = new User
                {
                    Email = email,
                    UserName = "Admin"
                };

                var result = await userManager.CreateAsync(admin, password);

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, Roles.LecturerRole); //TODO: dangerous
                    admin.EmailConfirmed = true;
                    await userManager.UpdateAsync(admin);
                }
            }
        }
    }
}
