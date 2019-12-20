using System;

namespace HwProj.NotificationsService.API.Models
{
    public class NotificationFilter
    {
        public DateTime Date { get; set; }
        public (string, string)? TimeSpan { get; set; }
        public int Offset { get; set; }
        public string Owner { get; set; }
        public bool? HasSeen { get; set; }
        public bool? Important { get; set; }
    }
}