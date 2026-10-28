using System;
using System.Threading.Tasks;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.SolutionsService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services.Digest;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class RateEventHandler : IEventHandler<RateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IConfigurationSection _configuration;

        public RateEventHandler(
            INotificationsRepository notificationRepository,
            IConfiguration configuration)
        {
            _notificationRepository = notificationRepository;
            _configuration = configuration.GetSection("Notification");
        }

        public async Task HandleAsync(RateEvent @event)
        {
            var taskUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}/homeworks?taskId={@event.Task.Id}";
            var comment = LecturerComment.Parse(@event.Solution.LecturerComment);

            var message = new NotificationMessage(CategoryState.Homeworks, "Решение проверено")
                .WithSubject($"Оценка за задачу «{@event.Task.Title}»")
                .WithText($"Преподаватель проверил ваше решение задачи {NotificationHtml.Link(taskUrl, @event.Task.Title)}.")
                .WithDetail("Оценка", NotificationHtml.Bold($"{@event.Solution.Rating ?? 0} / {@event.Task.MaxRating}"))
                .WithBreakdown("Критерии оценивания", comment.Criteria)
                .WithQuote("Комментарий преподавателя", comment.Text)
                .WithAction("Открыть задачу", taskUrl)
                .WithDigest(new DigestItem
                {
                    Kind = DigestItemKind.SolutionRated,
                    CourseId = @event.CourseId,
                    CourseName = @event.CourseName,
                    TaskId = @event.Task.Id,
                    TaskTitle = @event.Task.Title,
                    Rating = @event.Solution.Rating ?? 0,
                    MaxRating = @event.Task.MaxRating,
                    Comment = @event.Solution.LecturerComment
                });

            var notification = message.ToNotification(@event.Solution.StudentId, "SolutionService",
                @event.Solution.RatingDate ?? DateTime.UtcNow);
            await _notificationRepository.AddAsync(notification);
        }
    }
}
