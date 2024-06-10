using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.Models.Roles;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class LecturerInvitedToCourseEventHandler : EventHandlerBase<LecturerInvitedToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;
        private readonly IAuthServiceClient _authServiceClient;

        public LecturerInvitedToCourseEventHandler(
            INotificationsRepository notificationRepository,
            IConfiguration configuration,
            IEmailService emailService, 
            IAuthServiceClient authServiceClient)
        {
            _notificationRepository = notificationRepository;
            _emailService = emailService;
            _authServiceClient = authServiceClient;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(LecturerInvitedToCourseEvent @event)
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

            var mentor = await _authServiceClient.GetAccountData(notification.Owner);
            if (mentor.Role == Roles.ExpertRole)
            {
                return;
            }
            
            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, @event.MentorEmail, "HwProj");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
