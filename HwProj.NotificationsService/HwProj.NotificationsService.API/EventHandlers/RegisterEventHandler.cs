using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.Models.Roles;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class RegisterEventHandler : EventHandlerBase<StudentRegisterEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IEmailService _emailService;
        private readonly IAuthServiceClient _authServiceClient;

        public RegisterEventHandler(
            INotificationsRepository notificationRepository, 
            IEmailService emailService, 
            IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _emailService = emailService;
            _authServiceClient = authServiceClient;
        }

        public override async Task HandleAsync(StudentRegisterEvent @event)
        {
            var notification = new Notification
            {
                Sender = "AuthService",
                Body = $"{@event.Name} {@event.Surname}, Добро Пожаловать в HwProj2.",
                Category = CategoryState.Profile,
                Date = DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.UserId
            };

            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, @event.Email, "HwProj");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
