using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.API.Services
{
    public interface INotificationsService
    {
        Task<long> AddNotificationAsync(string userId, Notification notification);
        Task<Notification[]> GetAsync(string userId, NotificationFilter filter = null);
        Task MarkAsSeenAsync(string userId, long[] notificationIds);
        Task MakeInvisibleNotificationsAsync(string userId, long[] notificatonIds);
    }
}