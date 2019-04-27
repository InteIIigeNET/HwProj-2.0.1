using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using System.Text;

namespace HwProj.APIGateway
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
            => Configuration = configuration;

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            var authenticationProviderKey = "GatewayKey";
            var securityKey = Encoding.ASCII.GetBytes("Mkey12412rf12f1g12412e21f212g");

            services.AddAuthentication()
                .AddJwtBearer(authenticationProviderKey, x =>
                {
                    x.RequireHttpsMetadata = false;
                    x.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidIssuer = "AuthSurvice",
                        ValidateIssuer = true,

                        ValidateAudience = false,

                        ValidateLifetime = true,

                        IssuerSigningKey = new SymmetricSecurityKey(securityKey),

                        ValidateIssuerSigningKey = true
                    };
                });

            services.AddOcelot();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
            => app.UseOcelot().Wait();
    }
}