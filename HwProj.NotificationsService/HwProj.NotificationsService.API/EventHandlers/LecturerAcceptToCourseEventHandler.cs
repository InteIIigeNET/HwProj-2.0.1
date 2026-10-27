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
    public class LecturerAcceptToCourseEventHandler : EventHandlerBase<LecturerAcceptToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public LecturerAcceptToCourseEventHandler(
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

        public override async Task HandleAsync(LecturerAcceptToCourseEvent @event)
        {
            var courseUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}";

            var message = new NotificationMessage(CategoryState.Courses, "Заявка на курс принята")
                .WithSubject($"Вас приняли на курс «{@event.CourseName}»")
                .WithText($"Вас приняли на курс {NotificationHtml.Link(courseUrl, @event.CourseName)}. " +
                          "Теперь вам доступны его домашние работы и сдача решений.")
                .WithAction("Перейти к курсу", courseUrl);

            var student = await _authServiceClient.GetAccountData(@event.StudentId);

            var addNotificationTask =
                _notificationRepository.AddAsync(message.ToNotification(@event.StudentId, "CourseService"));
            var sendEmailTask = _emailService.SendEmailAsync(message, student.Email, student.Name);

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
