using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;
using System.Data.SqlClient;

namespace HwProj.NotificationsService.API.Repositories
{
    public class NotificationsRepository : CrudRepository<Notification>, INotificationsRepository
    {
        public NotificationsRepository(NotificationsContext context)
            : base(context)
        {
        }

        public async Task UpdateBatchAsync(string userId, long[] ids, Expression<Func<Notification, Notification>> updateFactory)
        {
            await Context.Set<Notification>()
                .Where(t => t.Owner == userId && ids.Contains(t.Id))
                .UpdateAsync(updateFactory).ConfigureAwait(false);
        }

        public async Task<Notification[]> GetAllByUserAsync(string userId, NotificationFilter filter)
        {
            var result = Context.Set<Notification>().Where(t => t.Owner == userId);

            if (filter == null)
            {
                return await result.OrderBy(t => t.Date).ToArrayAsync();
            }

            if (filter.HasSeen != null)
            {
                result = result.Where(t => t.HasSeen == filter.HasSeen);
            }
            if (filter.Important != null)
            {
                result = result.Where(t => DateTime.Now.Subtract(t.Date) >= TimeSpan.FromDays(14));
            }
            if (!string.IsNullOrWhiteSpace(filter.Category))
            {
                result = result.Where(t => t.Category == filter.Category);
            }
            if (!string.IsNullOrWhiteSpace(filter.Sender))
            {
                result = result.Where(t => t.Sender == filter.Sender);
            }
            if (filter.PeriodOfTime != null)
            {
                result = result.Where(t => DateTime.Now.Subtract(t.Date) <= TimeSpan.FromDays((int)filter.PeriodOfTime));
            }

            result = result.OrderByDescending(t => t.Date);

            if (filter.Offset != null)
            {
                result = result.Skip(filter.Offset.Value);
            }
            if (filter.MaxCount != null)
            {
                result = result.Take(filter.MaxCount.Value);
            }

            return await result.ToArrayAsync().ConfigureAwait(false);
        }
    }
}