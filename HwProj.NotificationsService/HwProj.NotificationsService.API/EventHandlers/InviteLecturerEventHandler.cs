using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.AuthService.Client;
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
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IEmailService _emailService;

        public InviteLecturerEventHandler(INotificationsRepository notificationRepository, INotificationsService notificationsService, IAuthServiceClient authServiceClient, IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _notificationsService = notificationsService;
            _authServiceClient = authServiceClient;
            _emailService = emailService;
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
            
            var student = await _authServiceClient.GetAccountData(notification.Owner);
            
            await _notificationRepository.AddAsync(notification);
            await _emailService.SendEmailAsync(notification, student.Email, "HwProj");
        }
    }
}