using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.SolutionsService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.NotificationsService.API.Services.Messages;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class RateEventHandler : EventHandlerBase<RateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public RateEventHandler(
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

        public override async Task HandleAsync(RateEvent @event)
        {
            var taskUrl = $"{_configuration["Url"]}/courses/{@event.CourseId}/homeworks?taskId={@event.Task.Id}";
            var comment = LecturerComment.Parse(@event.Solution.LecturerComment);

            var message = new NotificationMessage(CategoryState.Homeworks, "Решение проверено")
                .WithSubject($"Оценка за задачу «{@event.Task.Title}»")
                .WithText($"Преподаватель проверил ваше решение задачи {NotificationHtml.Link(taskUrl, @event.Task.Title)}.")
                .WithDetail("Оценка", NotificationHtml.Bold($"{@event.Solution.Rating ?? 0} / {@event.Task.MaxRating}"))
                .WithBreakdown("Критерии оценивания", comment.Criteria)
                .WithQuote("Комментарий преподавателя", comment.Text)
                .WithAction("Открыть задачу", taskUrl);

            var student = await _authServiceClient.GetAccountData(@event.Solution.StudentId);

            var notification = message.ToNotification(@event.Solution.StudentId, "SolutionService",
                @event.Solution.RatingDate ?? DateTime.UtcNow);
            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(message, student.Email, student.Name);

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
