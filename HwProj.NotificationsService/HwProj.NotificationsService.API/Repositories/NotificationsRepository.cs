using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;
using HwProj.Repositories.Net8;
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
                t => new Notification { HasSeen = true });

        public async Task UpdateBatchAsync(string userId, long[] ids,
            Expression<Func<Notification, Notification>> updateFactory) =>
            await Context.Set<Notification>()
                .Where(t => t.Owner == userId && ids.Contains(t.Id))
                .UpdateAsync(updateFactory);

        public async Task<Notification[]> GetAllByUserAsync(string userId)
        {
            var notifications = Context.Set<Notification>()
                .AsNoTracking()
                .Where(t => t.Owner == userId && !t.IsDigestOnly);

            var newNotifications = await notifications
                .Where(t => t.HasSeen == false)
                .ToListAsync();
            var readNotifications = await notifications
                .Where(t => t.HasSeen == true)
                .OrderByDescending(t => t.Date)
                .Take(100)
                .ToListAsync();

            return newNotifications.Concat(readNotifications).ToArray();
        }

        public async Task<int> GetNewCountAsync(string userId) =>
            await Context.Set<Notification>()
                .Where(t => t.Owner == userId && !t.HasSeen && !t.IsDigestOnly)
                .CountAsync();

        public async Task<string[]> GetDigestRecipientIdsAsync(DateTime since, DateTime until) =>
            await Context.Set<Notification>()
                .Where(t => t.DigestKind != null && t.Date >= since && t.Date < until)
                .Select(t => t.Owner)
                .Distinct()
                .ToArrayAsync();

        public async Task<Notification[]> GetDigestNotificationsAsync(string[] ownerIds, DateTime since,
            DateTime until) =>
            await Context.Set<Notification>()
                .Where(t => t.DigestKind != null && t.Date >= since && t.Date < until && ownerIds.Contains(t.Owner))
                .OrderBy(t => t.Id)
                .Select(t => new Notification
                {
                    Id = t.Id,
                    Owner = t.Owner,
                    Date = t.Date,
                    DigestKind = t.DigestKind,
                    DigestData = t.DigestData
                })
                .ToArrayAsync();
    }
}
