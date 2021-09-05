using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    // ReSharper disable once UnusedType.Global
    public class RegisterEventHandler : IEventHandler<StudentRegisterEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationsService _notificationsService;

        public RegisterEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
        }

        public async Task HandleAsync(StudentRegisterEvent @event)
        {
            var notification = new Notification
            {
                Sender = "AuthService",
                Body = $"{@event.Name} {@event.Surname}, Добро Пожаловать в HwProj2.",
                Category = "AuthService",
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.UserId
            };
            await _notificationRepository.AddAsync(notification);
            await _notificationsService.SendEmailAsync(notification, @event.Email);
        }
    }
}