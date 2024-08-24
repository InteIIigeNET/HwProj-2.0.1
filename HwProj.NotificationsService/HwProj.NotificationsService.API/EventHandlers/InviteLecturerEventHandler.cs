using System;
using System.Threading.Tasks;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class InviteLecturerEventHandler : EventHandlerBase<InviteLecturerEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationSettingsRepository _settingsRepository;
        private readonly IEmailService _emailService;

        public InviteLecturerEventHandler(
            INotificationsRepository notificationRepository,
            INotificationSettingsRepository settingsRepository,
            IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _settingsRepository = settingsRepository;
            _emailService = emailService;
        }

        public override async Task HandleAsync(InviteLecturerEvent @event)
        {
            var userId = @event.UserId;

            var setting = await _settingsRepository.GetAsync(userId, NotificationsSettingCategory.OtherEventsCategory);
            if (!setting!.IsEnabled) return;

            var notification = new Notification
            {
                Sender = "AuthService",
                Body = "Вас добавили в список лекторов.",
                Category = CategoryState.Courses,
                Date = DateTime.UtcNow,
                Owner = userId
            };

            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, @event.UserEmail, "HwProj");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
