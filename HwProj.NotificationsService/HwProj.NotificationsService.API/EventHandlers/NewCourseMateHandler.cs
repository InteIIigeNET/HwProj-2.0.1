using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class NewCourseMateHandler : EventHandlerBase<NewCourseMateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly INotificationSettingsService _settingsService;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public NewCourseMateHandler(
            INotificationsRepository notificationRepository,
            INotificationSettingsService settingsService,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _authServiceClient = authServiceClient;
            _emailService = emailService;
            _settingsService = settingsService;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(NewCourseMateEvent @event)
        {
            var user = await _authServiceClient.GetAccountData(@event.StudentId);
            var url = _configuration["Url"];
            var courseUrl = $"{url}/courses/{@event.CourseId}";
            var studentName = NotificationHtml.FullName(user.Name, user.Surname);

            var message = new NotificationMessage(CategoryState.Courses, "Новая заявка на курс")
                .WithSubject($"{studentName}: заявка на курс «{@event.CourseName}»")
                .WithText($"Студент {NotificationHtml.Link($"{url}/profile/{@event.StudentId}", studentName)}" +
                          $" подал заявку на вступление в курс {NotificationHtml.Link(courseUrl, @event.CourseName)}.")
                .WithAction("Рассмотреть заявку", $"{courseUrl}/applications");

            var mentorIds = @event.MentorIds.Split('/');
            var mentors = await _authServiceClient.GetAccountsData(mentorIds);

            //TODO: fix
            foreach (var mentor in mentors)
            {
                var setting = await _settingsService.GetAsync(mentor.UserId,
                    NotificationsSettingCategory.NewCourseMateCategory);
                if (!setting.IsEnabled) continue;

                var addNotificationTask =
                    _notificationRepository.AddAsync(message.ToNotification(mentor.UserId, "CourseService"));
                var sendEmailTask = _emailService.SendEmailAsync(message, mentor.Email, mentor.Name);

                await Task.WhenAll(addNotificationTask, sendEmailTask);
            }
        }
    }
}
