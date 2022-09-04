namespace HwProj.Models.NotificationsService
{
    public class CategorizedNotifications
    {
        public CategoryState Category { get; set; }
        public NotificationViewModel[] SeenNotifications { get; set; }
        public NotificationViewModel[] NotSeenNotifications { get; set; }
    }
}
