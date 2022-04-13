using System.Linq;

namespace HwProj.Models.NotificationsService
{
    public class CategorizedNotifications
    {
        public CategoryState Category { get; set; }

        public NotificationViewModel[] SeenNotifications { get; }

        public NotificationViewModel[] NotSeenNotifications { get; }

        public CategorizedNotifications(CategoryState category, NotificationViewModel[] seenNotifications,
            NotificationViewModel[] notSeenNotifications)
        {
            Category = category;
            SeenNotifications = seenNotifications;
            NotSeenNotifications = notSeenNotifications;
        }
    }
}