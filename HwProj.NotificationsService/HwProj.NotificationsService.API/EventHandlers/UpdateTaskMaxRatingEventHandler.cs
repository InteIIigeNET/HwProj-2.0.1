using System.Linq;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationService.Events.CoursesService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Services.Digest;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class UpdateTaskMaxRatingEventHandler : EventHandlerBase<UpdateTaskMaxRatingEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IConfigurationSection _configuration;

        public UpdateTaskMaxRatingEventHandler(
            INotificationsRepository notificationRepository,
            IConfiguration configuration)
        {
            _notificationRepository = notificationRepository;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(UpdateTaskMaxRatingEvent @event)
        {
            var courseUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}";
            var taskUrl = $"{courseUrl}/homeworks?taskId={@event.TaskId}";

            var message = new NotificationMessage(CategoryState.Homeworks, "Задача обновлена")
                .WithSubject($"Задача «{@event.TaskTitle}» обновлена")
                .WithText($"В курсе {NotificationHtml.Link(courseUrl, @event.CourseName)} обновлена задача " +
                          $"{NotificationHtml.Link(taskUrl, @event.TaskTitle)}. Загляните, чтобы не пропустить изменения.")
                .WithAction("Открыть задачу", taskUrl)
                .WithDigest(new DigestItem
                {
                    Kind = DigestItemKind.TaskUpdated,
                    CourseId = @event.CourseId,
                    CourseName = @event.CourseName,
                    TaskId = @event.TaskId,
                    TaskTitle = @event.TaskTitle
                });

            await _notificationRepository.AddRangeAsync(@event.StudentIds
                .Select(studentId => message.ToNotification(studentId, "CourseService")));
        }
    }
}
