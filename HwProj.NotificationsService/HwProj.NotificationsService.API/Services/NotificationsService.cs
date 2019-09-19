using System.Linq.Expressions;
using System.Threading.Tasks;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;

namespace HwProj.NotificationsService.API.Services
{
    public class NotificationsService : INotificationsService
    {
        private readonly INotificationsRepository _repository;

        public NotificationsService(INotificationsRepository repository)
        {
            _repository = repository;
        }

        public async Task<long> AddNotificationAsync(Notification notification)
        {
            var id = await _repository.AddAsync(notification);
            return id;
        }

        public async Task<Notification[]> GetAllByUserAsync(string userId, NotificationFilter filter = null)
        {
            filter = filter ?? new NotificationFilter
            {
                MaxCount = 50, 
            };
            return await _repository.GetAllByUserAsync(userId, filter);
        }

        public async Task MarkAsSeenAsync(string userId, long[] notificationIds)
        {
            await _repository.UpdateBatchAsync(userId, notificationIds,
                t => new Notification {HasSeen = true});
        }
    }
}