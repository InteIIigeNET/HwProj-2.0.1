using System;
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

        public async Task<Notification[]> GetAsync(string userId, NotificationFilter filter = null)
        {
            var mapperOfSpecification = new MapperOfSpecification();
            var specification = mapperOfSpecification.GetSpecification(filter);
            return await _repository.GetAllByUserAsync(specification, filter.Offset).ConfigureAwait(false);
        }

        public async Task MarkAsSeenAsync(string userId, long[] notificationIds)
        {
            await _repository.UpdateBatchAsync(userId, notificationIds,
                t => new Notification { HasSeen = true }).ConfigureAwait(false);
        }

        public async Task MarkAsImportantAsync(string userId, long[] notificationIds)
        {
            await _repository.UpdateBatchAsync(userId, notificationIds,
                t => new Notification { Important = true }).ConfigureAwait(false);
        }

        public async Task<Notification[]> GetInTimeAsync(string userId, NotificationFilter filter)
        {
            var mapperOfSpecification = new MapperOfSpecification();
            var specification = mapperOfSpecification.GetSpecification(filter);
            return await _repository.GetAllByUserAsync(specification).ConfigureAwait(false);
        }
    }
}