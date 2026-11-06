using System;
using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.NotificationService.Events.SolutionsService;
using HwProj.Models.SolutionsService;
using HwProj.NotificationsService.API.Models;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
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
            var comment = @event.Task.HideRatings
                ? SolutionCommentUtils.WithoutCriterionScores(@event.Solution.LecturerComment)
                : @event.Solution.LecturerComment;
            var outcome = @event.Task.HideRatings
                ? (@event.Solution.RequiresRevision ? "требует отправки исправленного решения." : "проверена.")
                : $"оценена на <b>{@event.Solution.Rating}/{@event.Task.MaxRating}</b>.";
            var commentBody = string.IsNullOrWhiteSpace(comment)
                ? ""
                : "<br><br><b>Комментарий преподавателя:</b>" +
                  $"<br><i>{comment}</i>";

            var notification = new Notification
            {
                Sender = "SolutionService",
                Body =
                    $"Задача <a href='{_configuration["Url"]}/courses/{@event.CourseId}/homeworks?taskId={@event.Task.Id}' target='_blank'>{@event.Task.Title}</a> {outcome}" +
                    $"{commentBody}",
                Category = CategoryState.Homeworks,
                Date = @event.Solution.RatingDate ?? DateTime.UtcNow,
                HasSeen = false,
                Owner = @event.Solution.StudentId
            };

            var student = await _authServiceClient.GetAccountData(notification.Owner);

            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(notification, student.Email, "Оценка");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
