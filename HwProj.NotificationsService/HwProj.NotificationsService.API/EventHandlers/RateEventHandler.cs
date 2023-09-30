using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using HwProj.SolutionsService.API.Events;
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
            var commentBody = string.IsNullOrWhiteSpace(@event.Solution.LecturerComment)
                ? ""
                : "<br><br><b>Комментарий преподавателя:</b>" +
                  $"<br><i>{@event.Solution.LecturerComment}</i>";

            var notification = new Notification
            {
                Sender = "SolutionService",
                Body =
                    $"Задача <a href='{_configuration["Url"]}/task/{@event.Task.Id}' target='_blank'>{@event.Task.Title}</a> оценена на " +
                    $"<b>{@event.Solution.Rating}/{@event.Task.MaxRating}</b>." +
                    $"{commentBody}",
                Category = CategoryState.Homeworks,
                Date = DateTimeUtils.GetMoscowNow(),
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
