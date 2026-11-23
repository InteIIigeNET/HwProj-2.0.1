using System.Text.Json.Serialization;
using HwProj.AuthService.Client;
using HwProj.Common.Net8;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Repositories;
using HwProj.SolutionsService.API.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace HwProj.SolutionsService.API
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
            services.AddDbContext<SolutionContext>(options => options.UseSqlServer(connectionString));
            services.AddScoped<ISolutionsRepository, SolutionsRepository>();
            services.AddScoped<IGithubSolutionCommitsRepository, GithubSolutionCommitsRepository>();
            services.AddScoped<ISolutionsService, Services.SolutionsService>();

            services.AddUserIdAuthentication();
            services.AddHttpClient();
            services.AddHttpContextAccessor();
            services.AddAuthServiceClient();
            services.AddCoursesServiceClient();

            services.AddEventBus(Configuration);

            services
                .AddCors()
                .AddControllers(options =>
                    // Модели из HwProj.Models собраны с nullable, без этого их string-свойства
                    // без '?' стали бы обязательными, и запросы с null отклонялись бы с 400
                    options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true)
                .AddJsonOptions(options =>
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

            services.AddAutoMapper(x => x.AddProfile<AutomapperProfile>());
        }

        public void Configure(IApplicationBuilder app, IHostEnvironment env, SolutionContext context)
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

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(x => x.MapControllers());
        }
    }
}
