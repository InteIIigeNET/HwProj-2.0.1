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
    public class LecturerRejectToCourseEventHandler : EventHandlerBase<LecturerRejectToCourseEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IConfigurationSection _configuration;

        public LecturerRejectToCourseEventHandler(
            INotificationsRepository notificationRepository,
            IConfiguration configuration)
        {
            _notificationRepository = notificationRepository;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(LecturerRejectToCourseEvent @event)
        {
            var courseUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}";

            var message = new NotificationMessage(CategoryState.Courses, "Заявка на курс отклонена")
                .WithSubject($"Заявка на курс «{@event.CourseName}» отклонена")
                .WithText($"К сожалению, вас не приняли на курс {NotificationHtml.Link(courseUrl, @event.CourseName)}. " +
                          "Если это ошибка, свяжитесь с преподавателем курса.")
                .WithAction("Перейти к курсу", courseUrl)
                .WithDigest(new DigestItem
                {
                    Kind = DigestItemKind.RejectedFromCourse,
                    CourseId = @event.CourseId,
                    CourseName = @event.CourseName
                });

            await _notificationRepository.AddAsync(message.ToNotification(@event.StudentId, "CourseService"));
        }
    }
}
