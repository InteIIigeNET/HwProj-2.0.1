using System.Runtime.InteropServices;
using Microsoft.Extensions.Configuration;
using IConfiguration = Microsoft.Extensions.Configuration.IConfiguration;

namespace HwProj.Common.Net8;

public static class ConnectionString
{
    public static string GetConnectionString(IConfiguration configuration)
    {
        var option = RuntimeInformation.IsOSPlatform(OSPlatform.Linux)
            ? "DefaultConnectionForLinux"
            : "DefaultConnectionForWindows";
        return configuration.GetConnectionString(option) ?? "";
    }
}