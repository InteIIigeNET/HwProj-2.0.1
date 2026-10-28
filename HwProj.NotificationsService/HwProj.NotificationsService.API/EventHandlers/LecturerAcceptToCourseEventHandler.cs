using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services.Digest;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class LecturerAcceptToCourseEventHandler : EventHandlerBase<LecturerAcceptToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IConfigurationSection _configuration;

        public LecturerAcceptToCourseEventHandler(
            INotificationsRepository notificationRepository,
            IConfiguration configuration)
        {
            _notificationRepository = notificationRepository;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(LecturerAcceptToCourseEvent @event)
        {
            var courseUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}";

            var message = new NotificationMessage(CategoryState.Courses, "Заявка на курс принята")
                .WithSubject($"Вас приняли на курс «{@event.CourseName}»")
                .WithText($"Вас приняли на курс {NotificationHtml.Link(courseUrl, @event.CourseName)}. " +
                          "Теперь вам доступны его домашние работы и сдача решений.")
                .WithAction("Перейти к курсу", courseUrl)
                .WithDigest(new DigestItem
                {
                    Kind = DigestItemKind.AcceptedToCourse,
                    CourseId = @event.CourseId,
                    CourseName = @event.CourseName
                });

            await _notificationRepository.AddAsync(message.ToNotification(@event.StudentId, "CourseService"));
        }
    }
}
