using System.Threading.Tasks;
using System.Web;
using HwProj.AuthService.API.Events;
using HwProj.EventBus.Client.Interfaces;
using HwProj.Models;
using HwProj.Models.NotificationsService;
using HwProj.NotificationsService.API.Repositories;
using HwProj.NotificationsService.API.Services;
using Microsoft.Extensions.Configuration;

namespace HwProj.NotificationsService.API.EventHandlers
{
    public class PasswordRecoveryEventHandler : EventHandlerBase<PasswordRecoveryEvent>
    {
        private readonly IConfiguration _configuration;
        private readonly INotificationsRepository _notificationRepository;
        private readonly IEmailService _emailService;

        public PasswordRecoveryEventHandler(INotificationsRepository notificationRepository, IEmailService emailService,
            IConfiguration configuration)
        {
            _notificationRepository = notificationRepository;
            _emailService = emailService;
            _configuration = configuration;
        }

        public override async Task HandleAsync(PasswordRecoveryEvent @event)
        {
            var frontendUrl = _configuration.GetSection("Notification")["Url"];
            var recoveryLink =
                $"{frontendUrl}/resetPassword?token={HttpUtility.UrlEncode(@event.Token)}&id={HttpUtility.UrlEncode(@event.UserId)}";
            var email = new Notification
            {
                Sender = "AuthService",
                Body = $"{@event.Name} {@event.Surname}, был запрошен сброс вашего пароля.<br/><br/>" +
                       $"Для изменения пароля перейдите по ссылке<br/><a href={recoveryLink}>Сменить пароль</a><br/><br/>" +
                       $"Если вы не запрашивали сброс пароля, проигнорируйте это письмо.",
                Category = CategoryState.Profile,
                Date = DateTimeUtils.GetMoscowNow(),
                HasSeen = false,
                Owner = @event.UserId
            };
            var notification = new Notification
            {
                Sender = "AuthService",
                Body = $"{@event.Name} {@event.Surname}, был запрошен сброс вашего пароля.",
                Category = CategoryState.Profile,
                Date = DateTimeUtils.GetMoscowNow(),
                HasSeen = false,
                Owner = @event.UserId
            };

            var addNotificationTask = _notificationRepository.AddAsync(notification);
            var sendEmailTask = _emailService.SendEmailAsync(email, @event.Email, "HwProj");

            await Task.WhenAll(addNotificationTask, sendEmailTask);
        }
    }
}
