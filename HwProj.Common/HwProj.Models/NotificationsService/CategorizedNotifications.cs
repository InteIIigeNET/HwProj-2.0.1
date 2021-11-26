namespace HwProj.Models.NotificationsService
{
    public class CategorizedNotifications
    {
        public CategoryState Category { get; set; }

        public NotificationViewModel[] SeenNotifications { get; }
        
        public NotificationViewModel[] NotSeenNotifications { get; }
    }
}