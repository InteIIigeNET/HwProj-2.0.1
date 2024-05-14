using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.Client;
using HwProj.NotificationsService.Client;
using HwProj.SolutionsService.Client;
using HwProj.Utils.Auth;
using HwProj.Utils.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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
            
            services.AddAuthentication(options =>
                {
                    options.DefaultScheme = authenticationProviderKey;
                })
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
                })
                .AddJwtBearer(AuthSchemeConstants.QueryStringTokenAuthentication, options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = "AuthService",
                        ValidateLifetime = false,
                        ValidateAudience = false,
                        IssuerSigningKey = AuthorizationKey.SecurityKey
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            if (context.Request.Query.ContainsKey("token"))
                            {
                                context.Token = context.Request.Query["token"];
                            }
                            else
                            {
                                context.Fail("Unauthorized");
                            }

                            return Task.CompletedTask;
                        },
                        OnTokenValidated = async context =>
                        {
                            var courseIdClaim = context.Principal.FindFirst("_courseId");
                            if (courseIdClaim == null)
                            {
                                context.Fail("Unauthorized");
                                return;
                            }
                            
                            var authServiceClient = context.HttpContext.RequestServices
                                .GetRequiredService<IAuthServiceClient>();
                            var statsAccessToken = await authServiceClient.GetGuestToken(courseIdClaim.Value);
                            var guestToken = context.Request.Query["token"];
                            
                            if (statsAccessToken.AccessToken != guestToken)
                            {
                                context.Fail("Unauthorized");
                            }
                        }
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
}
