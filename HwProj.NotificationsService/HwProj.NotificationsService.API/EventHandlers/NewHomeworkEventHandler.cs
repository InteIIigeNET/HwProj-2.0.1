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
    public class NewHomeworkEventHandler : EventHandlerBase<NewHomeworkEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public NewHomeworkEventHandler(
            INotificationsRepository notificationRepository,
            IAuthServiceClient authServiceClient,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _authServiceClient = authServiceClient;
            _emailService = emailService;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(NewHomeworkEvent @event)
        {
            var courseUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}";
            var homeworkUrl = $"{courseUrl}/homeworks?homeworkId={@event.HomeworkId}";

            var message = new NotificationMessage(CategoryState.Homeworks, "Новая домашняя работа")
                .WithSubject($"Новая домашняя работа «{@event.HomeworkTitle}»")
                .WithText($"В курсе {NotificationHtml.Link(courseUrl, @event.CourseName)}" +
                          $" опубликована домашняя работа {NotificationHtml.Link(homeworkUrl, @event.HomeworkTitle)}.")
                .WithAction("Открыть домашнюю работу", homeworkUrl);
            if (@event.DeadlineDate is { } deadline) message.WithDetail("Дедлайн", NotificationHtml.Date(deadline));

            var accountsData = await _authServiceClient.GetAccountsData(@event.StudentIds);

            foreach (var student in accountsData)
            {
                var addNotificationTask =
                    _notificationRepository.AddAsync(message.ToNotification(student!.UserId, "CourseService"));
                var sendEmailTask = _emailService.SendEmailAsync(message, student.Email, student.Name);

                await Task.WhenAll(addNotificationTask, sendEmailTask);
            }
        }
    }
}
