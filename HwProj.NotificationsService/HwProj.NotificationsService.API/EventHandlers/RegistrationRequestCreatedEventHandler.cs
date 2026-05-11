using System;
using System.Linq;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class RegistrationRequestCreatedEventHandler : EventHandlerBase<RegistrationRequestCreatedEvent>
    {
        private readonly INotificationsRepository _notificationsRepository;
        private readonly INotificationSettingsService _settingsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public RegistrationRequestCreatedEventHandler(
            INotificationsRepository notificationsRepository,
            INotificationSettingsService settingsService,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration,
            IEmailService emailService
        )
        {
            _notificationsRepository = notificationsRepository;
            _settingsService = settingsService;
            _authServiceClient = authServiceClient;
            _configuration = configuration.GetSection("Notification");
            _emailService = emailService;
        }

        public override async Task HandleAsync(RegistrationRequestCreatedEvent @event)
        {
            var url = _configuration["Url"];
            var lecturers = string.IsNullOrWhiteSpace(@event.MentorIds)
                ? await _authServiceClient.GetAllLecturers()
                : await _authServiceClient.GetAccountsData(@event.MentorIds.Split('/'));

            var roleText = @event.RequestedRole == "Lecturer"
                ? "преподавателя"
                : "студента";

            foreach (var lecturer in lecturers.Where(x => x != null))
            {
                var setting = await _settingsService.GetAsync(lecturer.UserId,
                    NotificationsSettingCategory.NewCourseMateCategory);
                if (!setting.IsEnabled)
                {
                    continue;
                }

                var body = @event.CourseId != null
                    ? $"Поступила новая заявка на регистрацию студента в курсе " +
                      $"<a href='{url}/courses/{@event.CourseId}'>{@event.CourseName}</a> " +
                      $"от {@event.Surname} {@event.Name} ({@event.Email})."
                    : $"Поступила новая заявка на регистрацию {roleText} в общем пуле " +
                      $"от {@event.Surname} {@event.Name} ({@event.Email}).";

                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body = body,
                    Category = CategoryState.Courses,
                    Date = DateTime.UtcNow,
                    HasSeen = false,
                    Owner = lecturer.UserId
                };

                var subject = @event.CourseId != null
                    ? $"Новая заявка в курс {@event.CourseName}"
                    : "Новая заявка на регистрацию";

                var addNotificationTask = _notificationsRepository.AddAsync(notification);
                var sendEmailTask = _emailService.SendEmailAsync(notification, lecturer.Email, subject);

                await Task.WhenAll(addNotificationTask, sendEmailTask);
            }
        }
    }
}