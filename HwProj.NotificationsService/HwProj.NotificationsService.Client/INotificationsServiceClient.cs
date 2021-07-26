using HwProj.Models.NotificationsService;
using System.Threading.Tasks;

namespace HwProj.NotificationsService.Client
{
    public interface INotificationsServiceClient
    {
        Task<NotificationViewModel[]> Get(string userId, NotificationFilter filter);
    }
}
