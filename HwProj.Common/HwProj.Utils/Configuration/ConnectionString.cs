using System.Runtime.InteropServices;
using Microsoft.Extensions.Configuration;
using IConfiguration = Microsoft.Extensions.Configuration.IConfiguration;

namespace HwProj.Utils.Configuration
{
    public static class ConnectionString
    {
        public static string GetConnectionString(IConfiguration configuration)
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux) ||
                RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                return configuration.GetConnectionString("DefaultConnectionForLinux");
            }

            return configuration.GetConnectionString("DefaultConnectionForWindows");
        }
    }
}