using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class InviteLecturerEventHandler : IEventHandler<InviteLecturerEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;

        public InviteLecturerEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
        }

        public async Task HandleAsync(InviteLecturerEvent @event)
        {
            var notification = new Notification
            {
                Sender = "AuthService",
                Body = "Вас добавили в список лекторов.",
                Category = "AuthService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.UserId
            };
            await _notificationRepository.AddAsync(notification);
            await _notificationsService.SendTelegramMessageAsync(notification);
        }
    }
}