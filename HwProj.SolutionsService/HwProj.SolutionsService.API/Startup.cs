using System.IO;
using System.Threading;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Util.Store;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.SolutionsService.API.Models;
using HwProj.SolutionsService.API.Repositories;
using HwProj.SolutionsService.API.Services;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HwProj.SolutionsService.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
        static readonly string[] Scopes = { SheetsService.Scope.Spreadsheets };
        static string ApplicationName = "HwProjSheets";


        public void ConfigureServices(IServiceCollection services)
        {
            var connectionString = ConnectionString.GetConnectionString(Configuration);
            services.AddDbContext<SolutionContext>(options => options.UseSqlServer(connectionString));
            services.AddScoped<ISolutionsRepository, SolutionsRepository>();
            services.AddScoped<ISolutionsService, Services.SolutionsService>();
            services.AddScoped(_ => ConfigureGoogleSheets());
            services.AddHttpClient();
            services.AddHttpContextAccessor();
            services.AddAuthServiceClient();
            services.AddCoursesServiceClient();
            services.AddEventBus(Configuration);
            services.ConfigureHwProjServices("Solutions API");
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IEventBus eventBus)
        {
            app.ConfigureHwProj(env, "Solutions API");
        }

        private SheetsService ConfigureGoogleSheets() 
        {
            GoogleCredential credential;

            using (var stream =
                new FileStream("credentials.json", FileMode.Open, FileAccess.ReadWrite))
            {
                credential = GoogleCredential.FromStream(stream)
                    .CreateScoped(Scopes);
            }

            return new SheetsService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName
            });
        }
    }
}
