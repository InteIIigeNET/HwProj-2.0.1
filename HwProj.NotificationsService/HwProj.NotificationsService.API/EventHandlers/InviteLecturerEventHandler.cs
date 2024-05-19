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
    public class InviteLecturerEventHandler : EventHandlerBase<InviteLecturerEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IEmailService _emailService;
        private readonly IAuthServiceClient _authServiceClient;

        public InviteLecturerEventHandler(
            INotificationsRepository notificationRepository, 
            IEmailService emailService, 
            IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _emailService = emailService;
            _authServiceClient = authServiceClient;
        }

        public override async Task HandleAsync(InviteLecturerEvent @event)
        {
            var notification = new Notification
            {
                Sender = "AuthService",
                Body = "Вас добавили в список лекторов.",
                Category = CategoryState.Courses,
                Date = DateTime.UtcNow,
                Owner = @event.UserId
            };

            var mentor = await _authServiceClient.GetAccountData(notification.Owner);
            if (mentor.Role == Roles.ExpertRole)
            {
                return;
            }
            
            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, @event.UserEmail, "HwProj");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
