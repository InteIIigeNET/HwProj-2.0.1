using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.AuthService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class InviteLecturerEventHandler : EventHandlerBase<InviteLecturerEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IEmailService _emailService;
        private readonly INotificationSettingsService _settingsService;
        private readonly IConfigurationSection _configuration;

        public InviteLecturerEventHandler(
            INotificationsRepository notificationRepository,
            IEmailService emailService,
            INotificationSettingsService settingsService,
            IConfiguration configuration)
        {
            _notificationRepository = notificationRepository;
            _emailService = emailService;
            _settingsService = settingsService;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(InviteLecturerEvent @event)
        {
            var mentorId = @event.UserId;

            var setting =
                await _settingsService.GetAsync(mentorId, NotificationsSettingCategory.InviteLecturerCategory);
            if (!setting.IsEnabled) return;

            var message = new NotificationMessage(CategoryState.Courses, "Вы стали лектором")
                .WithText("Вас добавили в список лекторов HwProj. Теперь вы можете создавать курсы, " +
                          "публиковать домашние работы и проверять решения студентов.")
                .WithAction("Создать курс", $"{_configuration["Url"]}/create_course");

            var addNotificationTask = _notificationRepository.AddAsync(message.ToNotification(mentorId, "AuthService"));
            var sendEmailTask = _emailService.SendEmailAsync(message, @event.UserEmail);

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
