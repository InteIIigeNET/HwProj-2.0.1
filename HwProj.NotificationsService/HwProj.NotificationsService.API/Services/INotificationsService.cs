using HwProj.Models.NotificationsService;
using System.Threading.Tasks;

namespace HwProj.NotificationsService.API.Services
{
    public interface INotificationsService
    {
        Task<long> AddNotificationAsync(Notification notification);
        CategorizedNotifications[] GroupAsync(Notification[] notifications);
        Task MarkAsSeenAsync(string userId, long[] notificationIds);
    }
}