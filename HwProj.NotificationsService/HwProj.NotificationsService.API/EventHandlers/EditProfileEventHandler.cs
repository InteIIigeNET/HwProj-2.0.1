using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class EditProfileEventHandler : IEventHandler<EditProfileEvent>
    {
        private readonly INotificationsRepository _notificationRepository;

        public EditProfileEventHandler(INotificationsRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task HandleAsync(EditProfileEvent @event)
        {
            await _notificationRepository.AddAsync(new Notification
            {
                Sender = "AuthService",
                Body = "Ваш профиль был успешно отредактирован.",
                Category = "AuthService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.UserId
            });
        }
    }
}