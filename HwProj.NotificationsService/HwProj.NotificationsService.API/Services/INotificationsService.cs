using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;

namespace HwProj.NotificationsService.API.Services
{
    public interface INotificationsService
    {
        Task<long> AddNotificationAsync(Notification notification);
        Task<Notification[]> GetAllByUser(string userId);
    }
}