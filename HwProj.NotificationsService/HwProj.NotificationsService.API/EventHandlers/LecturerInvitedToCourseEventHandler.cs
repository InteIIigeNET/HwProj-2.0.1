using System;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class LecturerInvitedToCourseEventHandler : EventHandlerBase<LecturerInvitedToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationSettingsService _settingsService;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public LecturerInvitedToCourseEventHandler(
            INotificationsRepository notificationRepository,
            INotificationSettingsService settingsService,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _settingsService = settingsService;
            _emailService = emailService;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(LecturerInvitedToCourseEvent @event)
        {
            var mentorId = @event.MentorId;

            var setting = await _settingsService.GetAsync(mentorId,
                NotificationsSettingCategory.LecturerInvitedToCourseCategory);
            if (!setting.IsEnabled) return;

            var notification = new Notification
            {
                Sender = "CourseService",
                Body =
                    $"Вас пригласили в качестве преподавателя на курс <a href='{_configuration["Url"]}/courses/{@event.CourseId}'>{@event.CourseName}</a>.",
                Category = CategoryState.Courses,
                Date = DateTime.UtcNow,
                Owner = mentorId
            };

            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, @event.MentorEmail, "HwProj");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}