using System;
using System.Threading.Tasks;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class LecturerInvitedToCourseEventHandler : IEventHandler<LecturerInvitedToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public LecturerInvitedToCourseEventHandler(
            INotificationsRepository notificationRepository,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _emailService = emailService;
            _configuration = configuration.GetSection("Notification");
        }

        public async Task HandleAsync(LecturerInvitedToCourseEvent @event)
        {
            var notification = new Notification
            {
                Sender = "CourseService",
                Body =
                    $"Вас пригласили в качестве преподавателя на курс <a href='{_configuration["Url"]}/courses/{@event.CourseId}'>{@event.CourseName}</a>.",
                Category = CategoryState.Courses,
                Date = DateTime.UtcNow,
                Owner = @event.MentorId
            };

            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, @event.MentorEmail, "HwProj");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
