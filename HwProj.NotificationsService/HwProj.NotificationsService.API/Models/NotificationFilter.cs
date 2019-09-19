using System;

namespace HwProj.NotificationsService.API.Models
{
    public class NotificationFilter
    {
        public string Sender { get; set; }
        public string Category { get; set; }
        public int? MaxCount { get; set; }
        public int? Offset { get; set; }
        public int? LastNotificationsId { get; set; }
        public bool? HasSeen { get; set; }
        public DateTime? LastDate { get; set; }
    }
}