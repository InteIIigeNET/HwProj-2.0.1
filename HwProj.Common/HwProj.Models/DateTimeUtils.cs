using System;

namespace HwProj.Models
{
    public static class DateTimeUtils
    {
        public static DateTime GetMoscowNow() => DateTime.UtcNow.AddHours(3);
    }
}
