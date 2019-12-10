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

        public async Task<Notification[]> GetAllByUserAsync(string userId, int offSet = 0, int maxCount = 50, Specification specification = null)
        {
            var result = Context.Set<Notification>().Where(notification => notification.Owner == userId)
                                                    .Where(specification.ToExpression())
                                                    .Skip(offSet)
                                                    .Take(maxCount);

            return await result.ToArrayAsync();
        }
    }
}