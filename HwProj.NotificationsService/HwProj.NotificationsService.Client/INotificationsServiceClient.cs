using HwProj.Models.NotificationsService;
using System.Threading.Tasks;

namespace HwProj.NotificationsService.Client
{
    public interface INotificationsServiceClient
    {
        Task<CategorizedNotifications[]> Get(string userId);
        Task MarkAsSeen(string userId, long[] notificationIds);
        Task<int> GetNewNotificationsCount(string userId);
        Task<bool> Ping();
    }
}
