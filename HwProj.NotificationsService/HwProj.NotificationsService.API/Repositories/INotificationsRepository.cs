using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.Models.NotificationsService;
using HwProj.Repositories;

namespace HwProj.NotificationsService.API.Repositories
{
    public interface INotificationsRepository : ICrudRepository<Notification, long>
    {
        Task UpdateBatchAsync(string userId, long[] ids, Expression<Func<Notification, Notification>> updateFactory);
        Task<Notification[]> GetAllByUserAsync(string userId);
        Task MarkAsSeenAsync(string userId, long[] notificationIds);
        Task<long> AddNotificationAsync(Notification notification);
    }
}