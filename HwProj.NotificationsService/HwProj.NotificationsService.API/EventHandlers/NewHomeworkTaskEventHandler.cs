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
    public class NewHomeworkTaskEventHandler : EventHandlerBase<NewHomeworkTaskEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IConfigurationSection _configuration;

        public NewHomeworkTaskEventHandler(
            INotificationsRepository notificationRepository,
            IConfiguration configuration)
        {
            _notificationRepository = notificationRepository;
            _configuration = configuration.GetSection("Notification");
        }

        public override async Task HandleAsync(NewHomeworkTaskEvent @event)
        {
            var courseUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}";
            var taskUrl = $"{courseUrl}/homeworks?taskId={@event.TaskId}";

            var message = new NotificationMessage(CategoryState.Homeworks, "Новая задача")
                .WithSubject($"Новая задача «{@event.TaskTitle}»")
                .WithText($"В курсе {NotificationHtml.Link(courseUrl, @event.CourseName)}" +
                          $" опубликована задача {NotificationHtml.Link(taskUrl, @event.TaskTitle)}.")
                .WithAction("Открыть задачу", taskUrl)
                .WithDigest(new DigestItem
                {
                    Kind = DigestItemKind.NewTask,
                    CourseId = @event.CourseId,
                    CourseName = @event.CourseName,
                    TaskId = @event.TaskId,
                    TaskTitle = @event.TaskTitle,
                    DeadlineDate = @event.DeadlineDate
                });
            if (@event.DeadlineDate is { } deadline) message.WithDetail("Дедлайн", NotificationHtml.Date(deadline));

            await _notificationRepository.AddRangeAsync(@event.StudentIds
                .Select(studentId => message.ToNotification(studentId, "CourseService")));
        }
    }
}
