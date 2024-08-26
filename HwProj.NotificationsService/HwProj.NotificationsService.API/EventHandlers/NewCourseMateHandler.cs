using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class NewCourseMateHandler : EventHandlerBase<NewCourseMateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationSettingsRepository _settingsRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public NewCourseMateHandler(
            INotificationsRepository notificationRepository,
            INotificationSettingsRepository settingsRepository,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _authServiceClient = authServiceClient;
            _emailService = emailService;
            _settingsRepository = settingsRepository;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(NewCourseMateEvent @event)
        {
            var user = await _authServiceClient.GetAccountData(@event.StudentId);
            var url = _configuration["Url"];

            var mentorIds = @event.MentorIds.Split('/');
            var mentors = await _authServiceClient.GetAccountsData(mentorIds);

            //TODO: fix
            foreach (var mentor in mentors)
            {
                var setting = await _settingsRepository.GetAsync(mentor.UserId,
                    NotificationsSettingCategory.NewCourseMateCategory);
                if (!setting!.IsEnabled) continue;

                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body =
                        $"Студент <a href='{url}/profile/{@event.StudentId}'>{user.Name} {user.Surname}</a>" +
                        $" подал заявку на вступление в курс <a href='{url}/courses/{@event.CourseId}'>{@event.CourseName}</a>.",
                    Category = CategoryState.Courses,
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = mentor.UserId
                };

                var subject = $"Новая заявка в курс {@event.CourseName}";

                var addNotificationTask = _notificationRepository.AddAsync(notification);
                var sendEmailTask = _emailService.SendEmailAsync(notification, mentor.Email, subject);

                await Task.WhenAll(addNotificationTask, sendEmailTask);
            }
        }
    }
}
