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
    public class LecturerRejectToCourseEventHandler : EventHandlerBase<LecturerRejectToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public LecturerRejectToCourseEventHandler(
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

        public override async Task HandleAsync(LecturerRejectToCourseEvent @event)
        {
            var courseUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}";

            var message = new NotificationMessage(CategoryState.Courses, "Заявка на курс отклонена")
                .WithSubject($"Заявка на курс «{@event.CourseName}» отклонена")
                .WithText($"К сожалению, вас не приняли на курс {NotificationHtml.Link(courseUrl, @event.CourseName)}. " +
                          "Если это ошибка, свяжитесь с преподавателем курса.")
                .WithAction("Перейти к курсу", courseUrl);

            var student = await _authServiceClient.GetAccountData(@event.StudentId);

            var addNotificationTask =
                _notificationRepository.AddAsync(message.ToNotification(@event.StudentId, "CourseService"));
            var sendEmailTask = _emailService.SendEmailAsync(message, student.Email, student.Name);

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
