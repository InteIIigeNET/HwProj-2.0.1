using HwProj.NotificationsService.API.Models;
using HwProj.Repositories;

namespace HwProj.NotificationsService.API.Repositories
{
    public class NotificationsRepository : CrudRepository<Notification>, INotificationsRepository
    {
        public NotificationsRepository(NotificationsContext context)
            : base(context)
        {
        }
    }
}