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
    public class StudentPassTaskEventHandler : EventHandlerBase<StudentPassTaskEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public StudentPassTaskEventHandler(
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

        public override async Task HandleAsync(StudentPassTaskEvent @event)
        {
            foreach (var m in @event.Course.MentorIds)
            {
                var notification = new Notification
                {
                    Sender = "SolutionService",
                    Body = $"{@event.Student.Name} {@event.Student.Surname} добавил новое " +
                           $"<a href='{@event.Solution.GithubUrl}' target='_blank'>решение</a>" +
                           $" задачи <a href='{_configuration["Url"]}/task/{@event.Task.Id}/{@event.Student.UserId}'>{@event.Task.Title}</a>" +
                           $" из курса <a href='{_configuration["Url"]}/courses/{@event.Course.Id}'>{@event.Course.Name}</a>.",
                    Category = CategoryState.Homeworks,
                    Date = DateTimeUtils.GetMoscowNow(),
                    HasSeen = false,
                    Owner = m
                };

                var mentor = await _authServiceClient.GetAccountData(notification.Owner);

                var addNotificationTask = _notificationRepository.AddAsync(notification);
                var sendEmailTask = _emailService.SendEmailAsync(notification, mentor.Email, "HwProj");

                await Task.WhenAll(addNotificationTask, sendEmailTask);
            }
        }
    }
}
