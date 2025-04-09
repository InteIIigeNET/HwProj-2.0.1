using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace HwProj.APIGateway.API
{
    public static class Program
    {
        public static void Main(string[] args)
        {
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .ConfigureAppConfiguration((hostingContext, config) =>
                {
                    config.SetBasePath(hostingContext.HostingEnvironment.ContentRootPath)
                        .AddEnvironmentVariables();
                })
                .ConfigureKestrel(options =>
                {
                    options.Limits.MaxRequestBodySize = 200 * 1024 * 1024;
                })
                .Build()
                .Run();
        }
    }
}
