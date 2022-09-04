using System.Linq;
using HwProj.Models.NotificationsService;

namespace HwProj.NotificationsService.API.Services
{
    public static class NotificationsDomain
    {
        public static CategorizedNotifications[] Group(NotificationViewModel[] notifications) =>
            notifications
                .GroupBy(t => t.Category)
                .Select(category => (
                    category.Key,
                    category.Where(t => t.HasSeen).ToArray(),
                    category.Where(t => !t.HasSeen).ToArray()))
                .Select(element =>
                    new CategorizedNotifications
                    {
                        Category = element.Key,
                        SeenNotifications = element.Item2,
                        NotSeenNotifications = element.Item3
                    })
                .ToArray();
    }
}
