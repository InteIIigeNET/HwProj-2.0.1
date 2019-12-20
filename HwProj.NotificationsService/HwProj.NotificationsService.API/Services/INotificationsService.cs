using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.API.Services
{
    public interface INotificationsService
    {
        Task<Notification[]> GetAsync(string userId, NotificationFilter filter = null);
        Task MarkAsSeenAsync(string userId, long[] notificationIds);
        Task MarkAsImportantAsync(string userId, long[] notificationsIds);
        Task<Notification[]> GetInTimeAsync(string userId, int timeSpan);
    }
}