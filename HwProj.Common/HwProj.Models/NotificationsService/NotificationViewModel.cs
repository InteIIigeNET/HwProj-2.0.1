namespace HwProj.Models.NotificationsService
{
    public class NotificationViewModel
    {
        public long Id { get; set; }
        public string Sender { get; set; }
        public string Owner { get; set; }
        public string Category { get; set; }
        public string Body { get; set; }
        public bool HasSeen { get; set; }
    }
}