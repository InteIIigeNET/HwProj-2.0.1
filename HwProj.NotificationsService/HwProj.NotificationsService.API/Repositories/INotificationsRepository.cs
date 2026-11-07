using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;
using HwProj.Repositories.Net8;

namespace HwProj.NotificationsService.API.Repositories
{
    public interface INotificationsRepository : ICrudRepository<Notification, long>
    {
        Task UpdateBatchAsync(string userId, long[] ids, Expression<Func<Notification, Notification>> updateFactory);
        Task<Notification[]> GetAllByUserAsync(string userId);
        Task<int> GetNewCountAsync(string userId);
        Task MarkAsSeenAsync(string userId, long[] notificationIds);
        Task<long> AddNotificationAsync(Notification notification);

        /// <summary> Получатели, у которых за период [since, until) есть события для дайжеста </summary>
        Task<string[]> GetDigestRecipientIdsAsync(DateTime since, DateTime until);

        /// <summary> События для дайжеста за период [since, until), без вёрстки для ленты </summary>
        Task<Notification[]> GetDigestNotificationsAsync(string[] ownerIds, DateTime since, DateTime until);
    }
}
