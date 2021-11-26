using HwProj.Models.NotificationsService;
using System.Threading.Tasks;
using Telegram.Bot.Types.ReplyMarkups;

namespace HwProj.NotificationsService.API.Services
{
    public interface INotificationsService
    {
        Task<long> AddNotificationAsync(Notification notification);
        Task<NotificationViewModel[]> GetAsync(string userId, NotificationFilter filter = null);
        Task MarkAsSeenAsync(string userId, long[] notificationIds);

        Task SendTelegramMessageAsync(Notification notification, InlineKeyboardMarkup inlineKeyboard);
    }
}