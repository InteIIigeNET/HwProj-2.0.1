using System.Threading.Tasks;
using HwProj.AuthService.Client;
using HwProj.CoursesService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class NewCourseMateHandler : EventHandlerBase<NewCourseMateEvent>
    {
        private readonly INotificationsRepository _notificationRepository;
        private readonly IAuthServiceClient _authServiceClient;
        private readonly IConfigurationSection _configuration;
        private readonly IEmailService _emailService;

        public NewCourseMateHandler(
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

        public override async Task HandleAsync(NewCourseMateEvent @event)
        {
            var user = await _authServiceClient.GetAccountData(@event.StudentId);
            var url = _configuration["Url"];

            //TODO: fix
            foreach (var m in @event.MentorIds.Split('/'))
            {
                var notification = new Notification
                {
                    Sender = "CourseService",
                    Body =
                        $"Пользователь <a href='{url}/profile/{@event.StudentId}'>{user.Name} {user.Surname}</a>" +
                        $" подал заявку на вступление в курс <a href='{url}/courses/{@event.CourseId}'>{@event.CourseName}</a>.",
                    Category = CategoryState.Courses,
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
