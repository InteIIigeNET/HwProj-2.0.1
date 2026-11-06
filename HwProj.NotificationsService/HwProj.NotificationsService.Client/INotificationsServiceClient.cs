using HwProj.Models.NotificationsService;
using HwProj.Models.Result;
using System.Threading.Tasks;

namespace HwProj.NotificationsService.Client
{
    public interface INotificationsServiceClient
    {
        Task<CategorizedNotifications[]> Get(string userId);
        Task MarkAsSeen(string userId, long[] notificationIds);
        Task<int> GetNewNotificationsCount(string userId);
        Task<NotificationsSettingDto[]> GetSettings(string userId);
        Task ChangeSetting(string userId, NotificationsSettingDto newSetting);
        Task<Result> SendDigest(string userId);
        Task<bool> Ping();
    }
}
