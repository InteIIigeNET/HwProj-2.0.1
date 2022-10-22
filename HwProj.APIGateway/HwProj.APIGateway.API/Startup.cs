using System.IO;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.NotificationsService.Client;
using HwProj.SolutionsService.Client;
using HwProj.Utils.Auth;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

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
            services.ConfigureHwProjServices("API Gateway");

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
