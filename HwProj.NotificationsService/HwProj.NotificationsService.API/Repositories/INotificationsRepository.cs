using HwProj.NotificationsService.API.Models;
using HwProj.Repositories;

namespace HwProj.NotificationsService.API.Repositories
{
    public interface INotificationsRepository : ICrudRepository<Notification>
    {
    }
}