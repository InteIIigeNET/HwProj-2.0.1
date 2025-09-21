using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationService.Events.AuthService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class InviteLecturerEventHandler : EventHandlerBase<InviteLecturerEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IEmailService _emailService;
        private readonly INotificationSettingsService _settingsService;

        public InviteLecturerEventHandler(
            INotificationsRepository notificationRepository,
            IEmailService emailService,
            INotificationSettingsService settingsService)
        {
            _notificationRepository = notificationRepository;
            _emailService = emailService;
            _settingsService = settingsService;
        }

        public override async Task HandleAsync(InviteLecturerEvent @event)
        {
            var mentorId = @event.UserId;

            var setting =
                await _settingsService.GetAsync(mentorId, NotificationsSettingCategory.InviteLecturerCategory);
            if (!setting.IsEnabled) return;

            var notification = new Notification
            {
                Sender = "AuthService",
                Body = "Вас добавили в список лекторов.",
                Category = CategoryState.Courses,
                Date = DateTime.UtcNow,
                Owner = mentorId
            };

            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, @event.UserEmail, "HwProj");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}