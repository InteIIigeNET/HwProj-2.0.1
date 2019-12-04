using System;

namespace HwProj.NotificationsService.API.Models
{
    public class NotificationFilter
    {
        public int? MaxCount { get; set; }
        public int? Offset { get; set; }
        public string Sender { get; set; }
        public string Category { get; set; }
        public bool? HasSeen { get; set; }
        public bool? Important { get; set; }
        public int? PeriodOfTime { get; set; }
        public DateTime Date { get; set; }
    }
}