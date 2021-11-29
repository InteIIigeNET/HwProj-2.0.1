using System.Threading.Tasks;
using HwProj.Models.NotificationsService;

namespace HwProj.NotificationsService.Client
{
    public interface INotificationsServiceClient
    {
        Task<NotificationViewModel[]> Get(string userId, NotificationFilter filter);

        Task MarkAsSeen(string userId, long[] notificationIds);
    }
}
