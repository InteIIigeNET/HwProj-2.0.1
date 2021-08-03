using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class InviteLecturerEventHandler : IEventHandler<InviteLecturerEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public InviteLecturerEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task HandleAsync(InviteLecturerEvent @event)
        {
            await _notificationRepository.AddAsync(new Notification
            {
                Sender = "AuthService",
                Body = "Вас добавили в список лекторов.",
                Category = "AuthService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.UserId
            });
        }
    }
}