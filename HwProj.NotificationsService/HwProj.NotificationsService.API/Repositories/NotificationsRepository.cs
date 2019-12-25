using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;
using HwProj.Repositories;
using Microsoft.EntityFrameworkCore;
using Z.EntityFramework.Plus;

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
                .AsNoTracking()
                .UpdateAsync(updateFactory).ConfigureAwait(false);
        }

        public async Task<Notification[]> GetAllByUserAsync(Specification<Notification> specification, int offSet)
        {
            var result = Context.Set<Notification>().Where(specification.ToExpression())
                                                    .Skip(offSet);

            return await result.ToArrayAsync();
        }
    }
}