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
using Microsoft.Extensions.Options;
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
            services.ConfigureHwProjServices("API Gateway");
            
            services.Configure<StudentsInfoOptions>(Configuration.GetSection("StudentsInfo"));
            
            services.AddSingleton<IStudentsInformation>(provider =>
            {
                var options = provider.GetRequiredService<IOptions<StudentsInfoOptions>>().Value;
                return new StudentsInformation(options.Login, options.Password);
            });
            
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
            
            services.AddAuthServiceClient();
            services.AddCoursesServiceClient();
            services.AddSolutionServiceClient();
            services.AddNotificationsServiceClient();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.ConfigureHwProj(env, "API Gateway");
        }
    }

    public class StudentsInfoOptions
    {
        public string DefaultPassword { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
    }
}