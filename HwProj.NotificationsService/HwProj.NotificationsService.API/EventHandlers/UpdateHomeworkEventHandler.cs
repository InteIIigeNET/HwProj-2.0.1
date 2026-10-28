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
    public class UpdateHomeworkEventHandler : IEventHandler<UpdateHomeworkEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IConfigurationSection _configuration;

        public UpdateHomeworkEventHandler(
            INotificationsRepository notificationRepository,
            IConfiguration configuration)
        {
            _notificationRepository = notificationRepository;
            _configuration = configuration.GetSection("Notification");
        }

        public async Task HandleAsync(UpdateHomeworkEvent @event)
        {
            var courseUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}";
            var homeworkUrl = $"{courseUrl}/homeworks?homeworkId={@event.HomeworkId}";

            var message = new NotificationMessage(CategoryState.Homeworks, "Домашняя работа обновлена")
                .WithSubject($"Домашняя работа «{@event.HomeworkTitle}» обновлена")
                .WithText($"В курсе {NotificationHtml.Link(courseUrl, @event.CourseName)} обновлена домашняя работа " +
                          $"{NotificationHtml.Link(homeworkUrl, @event.HomeworkTitle)}. Загляните, чтобы не пропустить изменения.")
                .WithAction("Открыть домашнюю работу", homeworkUrl)
                .WithDigest(new DigestItem
                {
                    Kind = DigestItemKind.HomeworkUpdated,
                    CourseId = @event.CourseId,
                    CourseName = @event.CourseName,
                    HomeworkId = @event.HomeworkId,
                    HomeworkTitle = @event.HomeworkTitle
                });

            await _notificationRepository.AddRangeAsync(@event.StudentIds
                .Select(studentId => message.ToNotification(studentId, "CourseService")));
        }
    }
}
