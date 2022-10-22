using System.IO;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using HwProj.AuthService.Client;
using HwProj.ContentService.Client;
using HwProj.CoursesService.Client;
using HwProj.NotificationsService.Client;
using HwProj.SolutionsService.Client;
using HwProj.Utils.Auth;
using HwProj.Utils.Configuration;
using HwProj.APIGateway.API.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using IStudentsInfo;
using StudentsInfo;

namespace HwProj.APIGateway.API
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
            services.Configure<FormOptions>(options => { options.MultipartBodyLengthLimit = 200 * 1024 * 1024; });
            services.ConfigureHwProjServices("API Gateway");
            services.AddSingleton<IStudentsInformationProvider>(provider =>
                new StudentsInformationProvider(Configuration["StudentsInfo:Login"],
                    Configuration["StudentsInfo:Password"],
                    Configuration["StudentsInfo:LdapHost"], int.Parse(Configuration["StudentsInfo:LdapPort"]),
                    Configuration["StudentsInfo:SearchBase"]));
            const string authenticationProviderKey = "GatewayKey";

            services.AddAuthentication()
                .AddJwtBearer(authenticationProviderKey, x =>
                {
                    x.RequireHttpsMetadata = false;
                    x.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidIssuer = "AuthService",
                        ValidateIssuer = true,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        IssuerSigningKey = AuthorizationKey.SecurityKey,
                        ValidateIssuerSigningKey = true
                    };
                });

            services.AddHttpClient();
            services.AddHttpContextAccessor();
            services.AddScoped(_ => ConfigureGoogleSheets());

            services.AddAuthServiceClient();
            services.AddCoursesServiceClient();
            services.AddSolutionServiceClient();
            services.AddNotificationsServiceClient();
            services.AddContentServiceClient();

            services.AddScoped<CourseMentorOnlyAttribute>();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.ConfigureHwProj(env, "API Gateway");
        }

        private static SheetsService ConfigureGoogleSheets()
        {
            using var stream = new FileStream("googlesheets_credentials.json", FileMode.Open, FileAccess.ReadWrite);
            var credential = GoogleCredential.FromStream(stream).CreateScoped(SheetsService.Scope.Spreadsheets);

            return new SheetsService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "HwProjSheets"
            });
        }
    }
}
