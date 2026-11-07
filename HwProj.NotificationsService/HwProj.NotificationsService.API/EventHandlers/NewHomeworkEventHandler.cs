using System.Linq;
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
    public class NewHomeworkEventHandler : IEventHandler<NewHomeworkEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IConfigurationSection _configuration;

        public NewHomeworkEventHandler(
            INotificationsRepository notificationRepository,
            IConfiguration configuration)
        {
            _notificationRepository = notificationRepository;
            _configuration = configuration.GetSection("Notification");
        }

        public async Task HandleAsync(NewHomeworkEvent @event)
        {
            var courseUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}";
            var homeworkUrl = $"{courseUrl}/homeworks?homeworkId={@event.HomeworkId}";

            var message = new NotificationMessage(CategoryState.Homeworks, "Новая домашняя работа")
                .WithSubject($"Новая домашняя работа «{@event.HomeworkTitle}»")
                .WithText($"В курсе {NotificationHtml.Link(courseUrl, @event.CourseName)}" +
                          $" опубликована домашняя работа {NotificationHtml.Link(homeworkUrl, @event.HomeworkTitle)}.")
                .WithAction("Открыть домашнюю работу", homeworkUrl)
                .WithDigest(new DigestItem
                {
                    Kind = DigestItemKind.NewHomework,
                    CourseId = @event.CourseId,
                    CourseName = @event.CourseName,
                    HomeworkId = @event.HomeworkId,
                    HomeworkTitle = @event.HomeworkTitle,
                    DeadlineDate = @event.DeadlineDate
                });
            if (@event.DeadlineDate is { } deadline) message.WithDetail("Дедлайн", NotificationHtml.Date(deadline));

            await _notificationRepository.AddRangeAsync(@event.StudentIds
                .Select(studentId => message.ToNotification(studentId, "CourseService")));
        }
    }
}
