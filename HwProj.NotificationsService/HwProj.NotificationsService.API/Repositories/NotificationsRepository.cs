using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

namespace HwProj.NotificationsService.API.Repositories
{
    public class NotificationsRepository : CrudRepository<Notification, long>, INotificationsRepository
    {
        public NotificationsRepository(NotificationsContext context)
            : base(context)
        {
        }

        public async Task<long> AddNotificationAsync(Notification notification)
        {
            var id = await AddAsync(notification);
            return id;
        }

        public async Task MarkAsSeenAsync(string userId, long[] notificationIds) =>
            await UpdateBatchAsync(userId, notificationIds,
                t => new Notification {HasSeen = true});

        public async Task UpdateBatchAsync(string userId, long[] ids,
            Expression<Func<Notification, Notification>> updateFactory) =>
            await Context.Set<Notification>()
                .Where(t => t.Owner == userId && ids.Contains(t.Id))
                .UpdateAsync(updateFactory);

        public async Task<Notification[]> GetAllByUserAsync(string userId)
        {
            var result = Context.Set<Notification>().Where(t => t.Owner == userId);

            return await result.OrderByDescending(t => t.Date).ToArrayAsync();
        }
    }
}