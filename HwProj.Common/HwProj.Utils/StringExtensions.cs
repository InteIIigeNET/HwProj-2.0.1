using System;
using System.Linq;
using System.Text;

namespace HwProj.Utils;

public static class StringExtensions
{
    public static string ToCamelCase(this string route, string httpMethod)
    {
        var formattedRoute = new StringBuilder(route).Append($"/{httpMethod.ToLower()}");
        formattedRoute.Replace("{", "By/").Replace("}", string.Empty);
        var camelCaseRoute = formattedRoute.ToString().Split('/').Select(s => s.FirstCharToUpperCase());
        return string.Join(string.Empty, camelCaseRoute);
    }

    public static string FirstCharToUpperCase(this string s)
    {
        return $"{s[0].ToString().ToUpper()}{s.AsSpan(1)}";
    }
}