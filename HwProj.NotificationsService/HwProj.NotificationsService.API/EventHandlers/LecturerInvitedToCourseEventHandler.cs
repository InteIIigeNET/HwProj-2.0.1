using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.NotificationsService.API.Services.Messages;
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

            var courseUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}";

            var message = new NotificationMessage(CategoryState.Courses, "Приглашение в курс")
                .WithSubject($"Вас пригласили преподавать на курсе «{@event.CourseName}»")
                .WithText("Вас пригласили в качестве преподавателя на курс " +
                          $"{NotificationHtml.Link(courseUrl, @event.CourseName)}.")
                .WithAction("Перейти к курсу", courseUrl);

            var addNotificationTask = _notificationRepository.AddAsync(message.ToNotification(mentorId, "CourseService"));
            var sendEmailTask = _emailService.SendEmailAsync(message, @event.MentorEmail);

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
