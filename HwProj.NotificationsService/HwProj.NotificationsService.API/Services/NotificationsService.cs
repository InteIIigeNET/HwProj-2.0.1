using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
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

        //was made only for tests
        public async Task<long> AddNotificationAsync(string userId, Notification notification)
        {
            notification.Owner = userId;
            var id = await _repository.AddAsync(notification).ConfigureAwait(false);
            return id;
        }

        public async Task<Notification[]> GetAsync(string userId, NotificationFilter filter = null)
        {
            filter = filter ?? new NotificationFilter
            {
                MaxCount = 50, 
            };
            return await _repository.GetAllByUserAsync(userId, filter).ConfigureAwait(false);
        }

        public async Task MarkAsSeenAsync(string userId, long[] notificationIds)
        {
            await _repository.UpdateBatchAsync(userId, notificationIds,
                t => new Notification {HasSeen = true}).ConfigureAwait(false);
        }

        public async Task MakeInvisibleNotificationsAsync(string userId, long[] notificationsId)
        {
            await _repository.UpdateBatchAsync(userId, notificationsId,
                t => new Notification { Visible = false }).ConfigureAwait(false);
        }
    }
}